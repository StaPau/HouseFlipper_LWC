public with sharing class HF_GetPricebooks {
    @AuraEnabled (cacheable=true)
    public static List<Pricebook2> getPricebooks(Id recordTypeId){
        return [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2 WHERE RecordTypeId = :recordTypeId];
    }

    @AuraEnabled (cacheable=true)
    public static List<PricebookEntry> getPricebookEntries(Id pricebookId){
        return [SELECT Product2.Name, Product2Id, ProductCode, Pricebook2Id,UnitPrice, IsActive FROM PricebookEntry
                WHERE Pricebook2Id = :pricebookId];
    }

    @AuraEnabled
    public static void deletePricebook(Id pricebookId){
        try{
            List<Pricebook2> pricebookToDelete = [SELECT Id, Name FROM Pricebook2 WHERE Id = :pricebookId];
            delete pricebookToDelete;
        }
        catch (DmlException e ){
            System.debug(e);
        }
    }

//    @AuraEnabled (cacheable=true)
//    public static List<RecordType> getRecordTypeName(Id recordTypeId){
//        return [SELECT Name FROM RecordType WHERE Id = :recordTypeId AND SobjectType = 'Pricebook2'];
//    }

//    @AuraEnabled
//    public static Pricebook2 addPricebook(Pricebook2 pricebookToAdd){
//        try{
//            insert pricebookToAdd;
//            return pricebookToAdd;
//        }
//        catch (DmlException e){
//            System.debug('exception: '+e);
//        }
//        return pricebookToAdd;
//    }

}