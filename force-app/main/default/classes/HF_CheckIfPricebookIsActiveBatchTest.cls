@IsTest
public with sharing class HF_CheckIfPricebookIsActiveBatchTest {

    @TestSetup
    static void createTestData(){
        List<Pricebook2> pricebook = createNewPricebook();
        Pricebook2 standardPricebook = getStandardPricebook();
        List<Product2> productList = createProducts();
        List<PricebookEntry> pricebookEntryList = createPricebookEntries(pricebook[0],productList);
    }

    @IsTest
    static void shouldReturnTransformedFromNonActiveToActive(){
        HF_CheckIfPricebookIsActiveBatchService service = new HF_CheckIfPricebookIsActiveBatchService();
        List<Pricebook2> nonActivePricebooks = [SELECT Id, Name, Start_Date__c,End_Date__c, IsActive FROM Pricebook2 WHERE IsActive=false];
        Test.startTest();
        service.checkIfPriceBookIsActive(nonActivePricebooks);
        Test.stopTest();

        DateTime nowDateTime = DateTime.now();
        Pricebook2 activePricebook = [SELECT Id,Start_Date__c, End_Date__c, IsActive FROM Pricebook2
                        WHERE Start_Date__c <= :nowDateTime  AND End_Date__c > :nowDateTime LIMIT 1];

        System.assertEquals(true,activePricebook.IsActive);
    }

    private static List<Pricebook2> createNewPricebook(){

        List<Pricebook2> pricebookList = new List<Pricebook2>();
        Pricebook2 pricebook = new Pricebook2();
        pricebook.Name='Testing pricebook 1';
        pricebook.RecordTypeId= Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        pricebook.Start_Date__c=Datetime.parse('11/23/2022, 10:00 AM');
        pricebook.End_Date__c=Datetime.parse('11/30/2022, 10:00 AM');
        pricebook.IsActive=false;

        Pricebook2 pricebook2 = new Pricebook2();
        pricebook2.Name='Testing pricebook 2';
        pricebook2.RecordTypeId= Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        pricebook2.Start_Date__c=Datetime.parse('11/11/2022, 10:00 AM');
        pricebook2.End_Date__c=Datetime.parse('11/13/2022, 10:00 AM');
        pricebook2.IsActive=false;

        pricebookList.add(pricebook);
        pricebookList.add(pricebook2);

        insert pricebookList;
        return pricebookList;
    }

    private static List<Product2> createProducts(){

        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        List<Product2> productList = new List<Product2>();
        Product2 product1 = new Product2();
        product1.Name='Test Office 1';
        product1.RecordTypeId = productRecordTypeId;

        Product2 product2 = new Product2();
        product2.Name='Test Office 2';
        product2.RecordTypeId = productRecordTypeId;

        Product2 product3 = new Product2();
        product3.Name='Test Office 3';
        product3.RecordTypeId = productRecordTypeId;


        productList.add(product1);
        productList.add(product2);
        productList.add(product3);



        insert productList;
        return productList;
    }

    private static Pricebook2 getStandardPricebook(){
        Id pricebookId = Test.getStandardPricebookId();
        Pricebook2 standardPricebook = new Pricebook2(
                Id = pricebookId,
                IsActive = true
        );
        update standardPricebook;
        return standardPricebook;
    }

    private static List<PricebookEntry> createPricebookEntries(Pricebook2 pricebook, List<Product2> productList){

        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>();
        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];

        PricebookEntry pricebookEntry1 = new PricebookEntry();
        pricebookEntry1.Pricebook2Id=pricebook.Id;
        pricebookEntry1.Product2=productList[0];
        pricebookEntry1.Product2Id=productList[0].Id;
        pricebookEntry1.Pricebook2=pricebook;
        pricebookEntry1.UnitPrice=100001;

        PricebookEntry pricebookEntry2 = new PricebookEntry();
        pricebookEntry2.Pricebook2Id=pricebook.Id;
        pricebookEntry2.Pricebook2=pricebook;
        pricebookEntry2.Product2=productList[1];
        pricebookEntry2.Product2Id=productList[1].Id;
        pricebookEntry2.UnitPrice=200002;


        PricebookEntry standardPBE1 = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = productList[0].Id, UnitPrice = 100000, IsActive = true);

        PricebookEntry standardPBE2 = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = productList[1].Id, UnitPrice = 200000, IsActive = true);

        insert standardPBE1;
        insert standardPBE2;

        pricebookEntryList.add(pricebookEntry1);
        pricebookEntryList.add(pricebookEntry2);

        insert pricebookEntryList;
        return pricebookEntryList;

    }
}