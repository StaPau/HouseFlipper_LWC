public with sharing class HF_PricebookEntryWrapper {
    public class PricebookEntryWrapped{
        @AuraEnabled public String Id {get;set;}
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public String productCode {get;set;}
        @AuraEnabled public Id pricebookId {get;set;}
        @AuraEnabled public Double oldPrice {get;set;}
        @AuraEnabled public Double newPrice {get;set;}
    }

    public class PricebookEntryToOpportunityLineItemWrapper{
        @AuraEnabled public String Id {get;set;}
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public String productCode {get;set;}
        @AuraEnabled public Id pricebookId {get;set;}
        @AuraEnabled public Id productId {get;set;}
        @AuraEnabled public Double listPrice {get;set;} 
        @AuraEnabled public Double discount {get;set;}
        @AuraEnabled public Double quantity {get;set;}
        @AuraEnabled public Double total {get;set;}
        
    }

}