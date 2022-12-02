public with sharing class HF_GenereateQuotePDF {
    @InvocableMethod   
    public static void CreateQuote(List<Id> quoteIds)  
    { 
        createQuoteFutureMethod(quoteIds);
    }
    
    @future(callout=true)
    public static void createQuoteFutureMethod (List<Id> quoteIds) {
        String quoteUrl = '/quote/quoteTemplateDataViewer.apexp?';
        QuoteTemplateID__c qt = QuoteTemplateID__c.getInstance();
        String quoteTemplateId = qt.id__c;
        List<QuoteDocument> lstQuoteDoc = new List<QuoteDocument>();
        
        if(!quoteIds.isEmpty() && quoteIds.size() > 0) {
            
            for(Id quoteId :quoteIds) {
                quoteUrl += 'id=' + quoteId;
                quoteUrl += '&headerHeight=197&footerHeight=10';
                quoteUrl += '&summlid=' + quoteTemplateId;
                
                PageReference pageRef = new PageReference(quoteUrl);
                
                Blob quoteBlob;
                
                if(Test.isRunningTest()) {
                    quoteBlob = Blob.valueOf('Generate Pdf');
                } else {
                    quoteBlob = pageRef.getContentAsPDF();
                }
                
                QuoteDocument quoteDoc = new QuoteDocument();
                quoteDoc.Document = quoteBlob;
                quoteDoc.QuoteId = quoteId;
                lstQuoteDoc.add(quoteDoc);
            }
        }
        
        if(!lstQuoteDoc.isEmpty() && lstQuoteDoc.size() > 0) {
            Database.insert(lstQuoteDoc);
        }
        
    }
}
