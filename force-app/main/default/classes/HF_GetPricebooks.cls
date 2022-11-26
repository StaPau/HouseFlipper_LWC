public with sharing class HF_GetPricebooks {
    @AuraEnabled (cacheable=true)
    public static List<Pricebook2> getPricebooks(Id recordTypeId){
        return [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2
                WHERE RecordTypeId = :recordTypeId];
    }

    @AuraEnabled (cacheable=true)
    public static List<PricebookEntry> getPricebookEntries(Id pricebookId){
        return [SELECT Product2.Name, Product2Id, ProductCode, Pricebook2Id,UnitPrice, IsActive FROM PricebookEntry
                WHERE Pricebook2Id = :pricebookId];
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
//                pricebookEntry.ProductCode = pricebookEntryWrapped.productCode;
                pricebookEntryListToInsert.add(pricebookEntry);
            }
            insert pricebookEntryListToInsert;
        }
        catch (DmlException e){
            System.debug(e);
        }
        return pricebookEntryListToInsert;
    }

    @AuraEnabled
    public static String checkIfInsertedDatesAreValid(Datetime startDate, Datetime endDate, Id recordTypeId){
        String message='';
        List<Pricebook2> activePricebooks =
            [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2
        WHERE RecordTypeId = :recordTypeId AND IsActive=true];

        if(startDate > endDate){
            message+='End date cannot be before start date';
        }
        else{
            for(Pricebook2 activePricebook : activePricebooks){
                System.debug(activePricebook.Start_Date__c + '-' +activePricebook.End_Date__c);
                if((endDate >= activePricebook.Start_Date__c && startDate <= activePricebook.End_Date__c)  ){
                    message+='Pricebook dates are overlapping another: '+activePricebook.Name +' from: '+activePricebook.Start_Date__c+ ' to: '+activePricebook.End_Date__c;
                    break;
                }
            }
        }
        System.debug(message);
        return message;
    }

}