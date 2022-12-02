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

        return imageWrapperList;
    }

    @AuraEnabled
    public static void setMainImage(String mainImage, String recordId) {
        Product2 product = [SELECT Id, DisplayURL,Main_Image__c FROM Product2 WHERE Id = :recordId];
        product.Main_Image__c = mainImage;
        List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];

        ContentDocumentLink cdl1 = contentDocumentLinks[0];
        Id contentDocId = cdl1.ContentDocumentId;

        ContentVersion cv = [SELECT Id, Title FROM ContentVersion WHERE ContentDocumentId =: contentDocId];
        List<ContentDistribution> contentDistList = [
            SELECT
                Id, ContentDownloadUrl,ContentDocumentId, ContentVersionId,DistributionPublicUrl
            FROM ContentDistribution
            WHERE ContentDocumentId =: contentDocId
        ];

        if (contentDistList.size() == 0) {
            ContentDistribution cd = new ContentDistribution();
            cd.Name = cv.Title;
            cd.ContentVersionId = cv.Id;
            cd.PreferencesAllowViewInBrowser = true;
            cd.PreferencesLinkLatestVersion = true;
            cd.PreferencesNotifyOnVisit = false;
            cd.PreferencesPasswordRequired = false;
            cd.PreferencesAllowOriginalDownload = true;
            insert cd;
            product.DisplayURL=cd.DistributionPublicUrl;
        }
        else{
            product.DisplayURL=contentDistList[0].DistributionPublicUrl;
        }
        update product;        
    }
}