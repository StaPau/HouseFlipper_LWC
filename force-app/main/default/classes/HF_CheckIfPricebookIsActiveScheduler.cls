public with sharing class HF_CheckIfPricebookIsActiveScheduler implements Schedulable{
    public void execute(SchedulableContext ctx){
        HF_CheckIfPricebookIsActiveBatch setActiveBatch = new HF_CheckIfPricebookIsActiveBatch();
        Database.executeBatch(setActiveBatch,200);
    }
}