public with sharing class HF_ProductController {

    @AuraEnabled(Cacheable=true)
    public static List<Product2> getProductsNames(Id recordTypeId,Id pricebookId){
        return [SELECT Id,Name FROM Product2 WHERE RecordTypeId = :recordTypeId AND Id NOT IN
        (
                SELECT Product2Id FROM PricebookEntry WHERE Pricebook2Id = :pricebookId
        )];
    }

    @AuraEnabled
    public static List<PricebookEntry> getSelectedProductsInfo(List<Id> selectedProductsList){
        return [SELECT Id, Name, Product2Id, Product2.Name, Pricebook2Id, Pricebook2.Name, UnitPrice, ProductCode FROM PricebookEntry
                WHERE Pricebook2.Name = 'Standard Price Book' AND Product2Id IN  :selectedProductsList];
    }

    @AuraEnabled
    public static List<HF_PricebookEntryWrapper.PricebookEntryWrapped> getWrappedPricebookEntries(List<PricebookEntry> allSelectedProductsList,
            List<PricebookEntry> selectedProductsList, Double discount, String discountType){

        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> wrapperList = new List<HF_PricebookEntryWrapper.PricebookEntryWrapped>();
        for(PricebookEntry allPricebookEntry : allSelectedProductsList) {
            HF_PricebookEntryWrapper.PricebookEntryWrapped pricebookEntryWrapped = new HF_PricebookEntryWrapper.PricebookEntryWrapped();
            pricebookEntryWrapped.Id = allPricebookEntry.Product2Id;
            pricebookEntryWrapped.productName = allPricebookEntry.Name;
            pricebookEntryWrapped.productCode = allPricebookEntry.ProductCode;
            pricebookEntryWrapped.oldPrice = allPricebookEntry.UnitPrice;
            pricebookEntryWrapped.newPrice = allPricebookEntry.UnitPrice;
            pricebookEntryWrapped.pricebookId = allPricebookEntry.Pricebook2Id;
            for (PricebookEntry pricebookEntry : selectedProductsList) {
                if (allPricebookEntry.Product2Id == pricebookEntry.Product2Id){
                    switch on discountType {
                        when '1' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice + (pricebookEntry.UnitPrice * discount * 0.01));
                        }
                        when '2' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice - (pricebookEntry.UnitPrice * discount * 0.01));
                        }
                        when '3' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice + discount);
                        }
                        when '4' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice - discount);
                        }
                        when '5' {
                            pricebookEntryWrapped.newPrice = discount;
                        }
                    }
                    break;
                }
            }
            wrapperList.add(pricebookEntryWrapped);
            }
        return wrapperList;
    }


}