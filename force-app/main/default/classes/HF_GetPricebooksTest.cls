@IsTest
public with sharing class HF_GetPricebooksTest {
    @TestSetup
    static void createTestData(){
        Pricebook2 pricebook = createNewPricebook();
        Pricebook2 standardPricebook = getStandardPricebook();
        List<Product2> productList = createProducts();
        List<PricebookEntry> pricebookEntryList = createPricebookEntries(pricebook,productList);
    }

    @IsTest
    static void shouldReturnOneRecordFromGetPricebooks(){
        String pricebookRecordTypeId = Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Pricebook2> testPricebookList = HF_GetPricebooks.getPricebooks(pricebookRecordTypeId);
        Test.stopTest();

        System.assertEquals(1, testPricebookList.size());
    }

    @IsTest
    static void shouldReturnTwoPricebookEntriesB2B(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];

        Test.startTest();
        List<PricebookEntry> testPricebookEntriesList = HF_GetPricebooks.getPricebookEntries(pricebook.Id);
        Test.stopTest();

        System.assertEquals(2, testPricebookEntriesList.size());
    }

    @IsTest
    static void shouldAddPricebookEntryToExistingPricebook(){
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pbeList = new List<HF_PricebookEntryWrapper.PricebookEntryWrapped>();
        HF_PricebookEntryWrapper.PricebookEntryWrapped pbe = new HF_PricebookEntryWrapper.PricebookEntryWrapped();
        List<Pricebook2> pricebook = [SELECT Id FROM Pricebook2];
        Product2 product = [SELECT Id FROM Product2 WHERE Name='Test Office 3'];
        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = product.Id, UnitPrice = 100, IsActive = true);
        insert standardPBE;
        pbe.pricebookId=pricebook[1].Id;
        pbe.oldPrice=123;
        pbe.newPrice=321;
        pbe.productName='Test Office 3';
        pbe.Id = product.Id;

        pbeList.add(pbe);
        System.debug(pbeList);
        Test.startTest();
        List<PricebookEntry> testPricebookEntry = HF_GetPricebooks.addPricebookEntries(pbeList,pricebook[1].Id);
        Test.stopTest();

        List<PricebookEntry> allPricebookEntries = [SELECT Id, Name FROM PricebookEntry WHERE Pricebook2Id = :pricebook[1].Id];
        System.debug(allPricebookEntries);
        System.assertEquals(3,allPricebookEntries.size());
    }

    @IsTest
    static void shouldReturnMessageAboutStartDateHigherThanEndDate(){
        Datetime startDate = Datetime.parse('11/23/2022, 10:00 AM');
        Datetime endDate = Datetime.parse('11/21/2022, 10:00 AM');
        String pricebookRecordTypeId = Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        String message;

        Test.startTest();
        message = HF_GetPricebooks.checkIfInsertedDatesAreValid(startDate,endDate,pricebookRecordTypeId);
        Test.stopTest();

        System.assertEquals('End date cannot be before start date',message);
    }

    @IsTest
    static void shouldReturnMessageAboutOverlapping(){
        Datetime startDate = Datetime.parse('11/23/2022, 09:00 AM');
        Datetime endDate = Datetime.parse('11/25/2022, 10:00 AM');
        String pricebookRecordTypeId = Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        String message;

        Test.startTest();
        message = HF_GetPricebooks.checkIfInsertedDatesAreValid(startDate,endDate,pricebookRecordTypeId);
        Test.stopTest();

        List<Pricebook2> activePricebook = [SELECT Id,Name,Start_Date__c, End_Date__c, IsActive, RecordType.Name, Description FROM Pricebook2
        WHERE RecordTypeId = :pricebookRecordTypeId AND IsActive=true];

        String toCompare = 'Pricebook dates are overlapping another: '+activePricebook[0].Name +' from: '+activePricebook[0].Start_Date__c+ ' to: '+activePricebook[0].End_Date__c;
        System.assertEquals(toCompare,message);
    }

    private static Pricebook2 createNewPricebook(){
        Pricebook2 pricebook = new Pricebook2();
        pricebook.Name='Testing pricebook';
        pricebook.RecordTypeId= Schema.SObjectType.Pricebook2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        pricebook.Start_Date__c=Datetime.parse('11/23/2022, 10:00 AM');
        pricebook.End_Date__c=Datetime.parse('11/30/2022, 10:00 AM');
        pricebook.IsActive=true;

        insert pricebook;
        return pricebook;
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
        pricebookEntry1.UnitPrice=100000;

        PricebookEntry pricebookEntry2 = new PricebookEntry();
        pricebookEntry2.Pricebook2Id=pricebook.Id;
        pricebookEntry2.Pricebook2=pricebook;
        pricebookEntry2.Product2=productList[1];
        pricebookEntry2.Product2Id=productList[1].Id;
        pricebookEntry2.UnitPrice=200000;


        PricebookEntry standardPBE1 = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = productList[0].Id, UnitPrice = 100010, IsActive = true);

        PricebookEntry standardPBE2 = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = productList[1].Id, UnitPrice = 200020, IsActive = true);
        insert standardPBE1;
        insert standardPBE2;

        pricebookEntryList.add(pricebookEntry1);
        pricebookEntryList.add(pricebookEntry2);

        insert pricebookEntryList;
        return pricebookEntryList;

    }
}