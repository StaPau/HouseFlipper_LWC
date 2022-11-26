public with sharing class HF_GalleryProductService {

    public static final String URL = '/sfc/servlet.shepherd/document/download/';
    @AuraEnabled
    public static List<HF_ImageWrapper> contentImages(String recordId) {
        List<HF_ImageWrapper> imageWrapperList = new List<HF_ImageWrapper>();
        List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];
        for (ContentDocumentLink contentDocumentLink : contentDocumentLinks) {
            HF_ImageWrapper imageWrapper = new HF_ImageWrapper(contentDocumentLink, URL);
            imageWrapperList.add(imageWrapper);
        }
        System.debug(imageWrapperList);
        return imageWrapperList;
    }

    @AuraEnabled
    public static void setMainImage(String mainImage, String recordId) {
        Product2 product = [SELECT Id, Main_Image__c FROM Product2 WHERE Id = :recordId];
        product.Main_Image__c = mainImage;
        update product;
    }
}