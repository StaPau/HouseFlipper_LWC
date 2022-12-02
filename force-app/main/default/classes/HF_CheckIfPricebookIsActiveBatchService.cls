public with sharing class HF_CheckIfPricebookIsActiveBatchService {

    public void checkIfPriceBookIsActive(List<Pricebook2> priceBooks) {
        update setActive(priceBooks);
    }

    public List<Pricebook2> setActive(List<Pricebook2> pricebookList){
        Id B2BRecordTypeId = Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        Id B2CRecordTypeId = Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2C').getRecordTypeId();
        DateTime nowDateTime = DateTime.now();
        for(Pricebook2 pricebook : pricebookList) {
            if(pricebook.RecordTypeId == B2BRecordTypeId){
                if(nowDateTime >= pricebook.Start_Date__c && nowDateTime < pricebook.End_Date__c ) {
                    pricebook.IsActive = true;
                }else {
                    pricebook.IsActive = false;
                }
            }
            else if(pricebook.RecordTypeId == B2CRecordTypeId){
                if(nowDateTime >= pricebook.Start_Date__c && nowDateTime < pricebook.End_Date__c ) {
                    pricebook.IsActive = true;
                }else {
                    pricebook.IsActive = false;
                }
            }
        }

        return pricebookList;
    }
}