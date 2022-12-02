public with sharing class HF_PDFController {
    @InvocableMethod   
    public static void CreateQuoteEmail(List<Id> quoteId)  
    { 
        sendEmailWithPDF(quoteId);
    }
    
    @future(callout=true)
    public static void sendEmailWithPDF(List<Id> quoteId){
        String result;
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        List<Messaging.SingleEmailMessage> messages = new List<Messaging.SingleEmailMessage>();
        List<Quote> quote = [SELECT Id, Name, Email,OpportunityId, ContactId FROM  Quote WHERE Id IN :quoteId];
       
        List<Id> oppId = new List<Id>();

        for(Quote q : quote){
            oppId.add(q.OpportunityId);
        }
        List<Opportunity> oppList = [SELECT Id, AccountId FROM Opportunity WHERE Id IN  :oppId];
        List<Account> accountList = [SELECT Id FROM Account WHERE Id = :oppList[0].AccountId];
        Contact contact = [SELECT Id,Email FROM Contact WHERE Primary_Contact__c = true AND AccountId = :accountList[0].Id];
        List<quotedocument> docu = [SELECT id,Name,document FROM quotedocument WHERE QuoteId IN :quoteId];
        EmailTemplate template = [SELECT Id FROM EmailTemplate WHERE Name = 'Quote Email' LIMIT 1];
        List<Messaging.EmailFileAttachment> attachments = new List<Messaging.EmailFileAttachment>();
        for (QuoteDocument QD: docu) {
            Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
            efa.setFileName(QD.Name);
            efa.setBody(QD.Document);
            attachments.add(efa);
        }

            for(Id qId : quoteId){
                message.setTemplateId(template.Id);
                message.targetObjectId=contact.Id;
                message.setWhatId(qId);
                message.setFileAttachments(attachments);
                messages.add(message);
            }
        
        
        if(!messages.isEmpty()) {
            Messaging.sendEmail(messages);
        }else {
            
        }

    }


}
