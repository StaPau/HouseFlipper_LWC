public with sharing class HF_CheckIfPricebookIsActiveBatch implements Database.Batchable<sObject>{

    public Database.QueryLocator start (Database.BatchableContext bc){
        return Database.getQueryLocator('SELECT RecordTypeId, Start_Date__c, End_Date__c, IsActive FROM Pricebook2');
    }

    public void execute(Database.BatchableContext bc, List<Pricebook2> scope){
        HF_CheckIfPricebookIsActiveBatchService batchService = new HF_CheckIfPricebookIsActiveBatchService();
        batchService.setActive(scope);
    }

    public void finish(Database.BatchableContext bc){

    }
}