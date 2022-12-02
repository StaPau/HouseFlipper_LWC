public with sharing class HF_GetPricebooks {
    @AuraEnabled (cacheable=true)
    public static List<Pricebook2> getPricebooks(Id recordTypeId){
        try{
            return [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2
                    WHERE RecordTypeId = :recordTypeId];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled (cacheable=true)
    public static List<Pricebook2> getPricebooksToChooseForOpportunity(Id recordTypeId){
        String standardPB = System.Label.Standard_Price_Book;
        List<Pricebook2> pblist = new List<Pricebook2>();
        try{
            pblist = [SELECT Id, Name FROM Pricebook2 WHERE ( recordTypeId = :recordTypeId AND IsActive = true ) 
                        OR Name = : standardPB ];
            return pblist;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled (cacheable=true)
    public static List<PricebookEntry> getPricebookEntries(Id pricebookId){
        try{
            return [SELECT Product2.Name, Product2Id, ProductCode, Pricebook2Id,UnitPrice, IsActive FROM PricebookEntry
                    WHERE Pricebook2Id = :pricebookId];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    
    @AuraEnabled (cacheable=true)
    public static List<PricebookEntry> getPricebookEntriesWithStandard(Id pricebookId, String recordTypeName){
        try{
            return [SELECT Product2.Name, Product2Id, ProductCode, Pricebook2Id,UnitPrice, IsActive FROM PricebookEntry
                    WHERE Pricebook2Id = :pricebookId AND Product2.RecordType.Name = :recordTypeName];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<PricebookEntry> addPricebookEntries(List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList, Id pricebookId){
        List<PricebookEntry> pricebookEntryListToInsert = new List<PricebookEntry>();
        try{
            for(HF_PricebookEntryWrapper.PricebookEntryWrapped pricebookEntryWrapped : pricebookEntryWrappedList ){
                PricebookEntry pricebookEntry = new PricebookEntry();
                pricebookEntry.Product2Id = pricebookEntryWrapped.Id;
                pricebookEntry.Pricebook2Id = pricebookId;
                pricebookEntry.UnitPrice = pricebookEntryWrapped.newPrice;
                pricebookEntryListToInsert.add(pricebookEntry);
            }
            insert pricebookEntryListToInsert;
            return pricebookEntryListToInsert;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String checkIfInsertedDatesAreValid(Datetime startDate, Datetime endDate, Id recordTypeId){
  
        String message='';
        List<Pricebook2> activePricebooks =
            [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2
        WHERE RecordTypeId = :recordTypeId AND IsActive=true];

        if(startDate > endDate){
            throw new AuraHandledException(System.Label.End_Date_Before_Start_Date_Info);
        }
        else{
            for(Pricebook2 activePricebook : activePricebooks){
                if((endDate >= activePricebook.Start_Date__c && startDate <= activePricebook.End_Date__c)  ){
                    String overlappedPricebookName = String.valueOf(activePricebook.Name);
                    String overlappedStartDate = String.valueOf(activePricebook.Start_Date__c);
                    String overlappedEndDate = String.valueOf(activePricebook.End_Date__c);
                    List<String> parameters = new List<String>{overlappedPricebookName,overlappedStartDate, overlappedEndDate};
                    throw new AuraHandledException(String.format(System.Label.Pricebooks_Overlapping_Info,parameters));
                }
            }
        }
        return message;
    }

    @AuraEnabled(cacheable=true)
    public static List<HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper> getWrappedPricebookEntriesToOppLineItem(List<PricebookEntry> pricebookEntryList, 
            Double inputQuantity, Double inputDiscount){
        try{
            List<HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper> wrappedList = 
                new List<HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper>();

            for(PricebookEntry pricebookEntry : pricebookEntryList){
                HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper pricebookEntryToOppLineItem = 
                    new HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper();
                pricebookEntryToOppLineItem.Id=pricebookEntry.Id;
                pricebookEntryToOppLineItem.pricebookId=pricebookEntry.Pricebook2Id;
                pricebookEntryToOppLineItem.productId=pricebookEntry.Product2Id;
                pricebookEntryToOppLineItem.productName = pricebookEntry.Product2.Name;
                pricebookEntryToOppLineItem.listPrice = pricebookEntry.UnitPrice;
                pricebookEntryToOppLineItem.productCode = pricebookEntry.ProductCode;
                pricebookEntryToOppLineItem.quantity = inputQuantity;
                pricebookEntryToOppLineItem.discount = inputDiscount;

                wrappedList.add(pricebookEntryToOppLineItem);
 
            }
            return wrappedList;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsNamesFromOppLineItem (List<Id> oppLineItemList){
        try{
            return [SELECT Id, Name FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE Id IN :oppLineItemList)];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getNewOpportunityLineItemList(List<HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper> wrappedList, Id oppId){
        try{
            List<OpportunityLineItem> opportunityLineItemList = new List<OpportunityLineItem>();
            
            for(HF_PricebookEntryWrapper.PricebookEntryToOpportunityLineItemWrapper wrappedItem : wrappedList){
                OpportunityLineItem oppLineItem = new OpportunityLineItem();

                oppLineItem.Product2Id= wrappedItem.productId;
                oppLineItem.OpportunityId= oppId;
                oppLineItem.Quantity= wrappedItem.quantity;
                oppLineItem.Discount= wrappedItem.discount;
                oppLineItem.TotalPrice = (wrappedItem.listPrice-(wrappedItem.listPrice*wrappedItem.discount*0.01))*wrappedItem.quantity;
                opportunityLineItemList.add(oppLineItem);
            }
            return opportunityLineItemList;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

}