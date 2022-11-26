public with sharing class HF_ImageWrapper {

    @AuraEnabled
    public String contentDocumentId;
    @AuraEnabled
    public String contentDocumentUrl;

    public HF_ImageWrapper(ContentDocumentLink cdl, String URL) {
        this.contentDocumentId = cdl.ContentDocumentId;
        this.contentDocumentUrl = URL + cdl.ContentDocumentId;
    }
}