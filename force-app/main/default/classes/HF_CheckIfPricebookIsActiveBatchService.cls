public with sharing class HF_CheckIfPricebookIsActiveBatchService {

    public void checkIfPriceBookIsActive(List<Pricebook2> priceBooks) {
        update setActive(priceBooks);
    }

    public List<Pricebook2> setActive(List<Pricebook2> pricebookList){
        DateTime nowDateTime = DateTime.now();
        for(Pricebook2 pricebook : pricebookList) {
            if(nowDateTime >= pricebook.Start_Date__c && nowDateTime < pricebook.End_Date__c) {
                pricebook.IsActive = true;
            }else {
                pricebook.IsActive = false;
            }
        }
        return pricebookList;
    }
}