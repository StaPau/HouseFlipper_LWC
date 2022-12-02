public with sharing class HF_ImageWrapper {

    @AuraEnabled
    public String contentDocumentId;
    @AuraEnabled
    public String contentDocumentUrl;
    @AuraEnabled
    public String contentDistributionUrl;

    public HF_ImageWrapper(ContentDocumentLink cdl, String URL) {
        this.contentDocumentId = cdl.ContentDocumentId;
        this.contentDocumentUrl = URL + cdl.ContentDocumentId;
    }
}