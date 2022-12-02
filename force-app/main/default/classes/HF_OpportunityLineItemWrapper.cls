public with sharing class HF_OpportunityLineItemWrapper {
    @AuraEnabled public String Id{get;set;} 
    @AuraEnabled public String Name{get;set;}
    @AuraEnabled public String productCode {get;set;}
    @AuraEnabled public Id pricebookId {get;set;}
    @AuraEnabled public Id productId {get;set;}
    @AuraEnabled public Double listPrice {get;set;} 
    @AuraEnabled public Double discount {get;set;}
    @AuraEnabled public Double quantity {get;set;}
}
