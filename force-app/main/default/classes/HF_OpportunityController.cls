public with sharing class HF_OpportunityController {

    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getOpportunityLineItems(Id oppId){
       try{
            return [SELECT Id, Product2.Name,ProductCode, Discount,ListPrice,Quantity,UnitPrice,TotalPrice 
                FROM OpportunityLineItem WHERE OpportunityId = :oppId];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Opportunity getOpportunity(Id oppId){
        try{
            return [SELECT Id, Name, RecordTypeId, RecordType.Name FROM Opportunity WHERE Id = :oppId];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<HF_OpportunityLineItemWrapper> getConvertedOppLineItems(List<OpportunityLineItem> oppLineItemList){
        List<HF_OpportunityLineItemWrapper> oppLineItemWrapperList = new List<HF_OpportunityLineItemWrapper>();
        for(OpportunityLineItem opp : oppLineItemList){
            HF_OpportunityLineItemWrapper oppLine = new HF_OpportunityLineItemWrapper();
            oppLine.Name=opp.Name;
            oppLine.productCode=opp.ProductCode;
            oppline.quantity=opp.Quantity;
            oppLine.discount=opp.Discount;
            oppLineItemWrapperList.add(oppLine);

        }
        return oppLineItemWrapperList;
    }
}
