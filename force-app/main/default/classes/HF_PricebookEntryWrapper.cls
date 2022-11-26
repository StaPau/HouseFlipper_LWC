public with sharing class HF_PricebookEntryWrapper {
    public class PricebookEntryWrapped{
        @AuraEnabled public String Id {get;set;}
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public String productCode {get;set;}
        @AuraEnabled public Id pricebookId {get;set;}
        @AuraEnabled public Double oldPrice {get;set;}
        @AuraEnabled public Double newPrice {get;set;}
    }

}