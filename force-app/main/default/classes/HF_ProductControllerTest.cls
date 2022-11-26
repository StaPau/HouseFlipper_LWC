@IsTest
public with sharing class HF_ProductControllerTest {

    @TestSetup
    static void createTestData() {
        Pricebook2 pricebook = createNewPricebook();
        Pricebook2 standardPricebook = getStandardPricebook();
        List<Product2> productList = createProducts();
        List<PricebookEntry> pricebookEntryList = createPricebookEntries(pricebook,productList);
    }

    @IsTest
    static void shouldReturnOneProductNotIncludedInPricebook(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];

        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);
        Test.stopTest();

        System.assertEquals(1, productList.size());


    }

    @IsTest
    static void shouldGetOneProductInfoFromSelectedInMultiPicklist(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300030, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> pricebookEntrySelectedInfo = HF_ProductController.getSelectedProductsInfo(idList);
        Test.stopTest();

        System.assertEquals(1, pricebookEntrySelectedInfo.size());
    }

    @IsTest
    static void shouldIncreaseOldPriceToNewPriceByPrecentage(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300000, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> productListToChange = [SELECT Id, Name, Pricebook2Id, Product2Id, UnitPrice, ProductCode FROM PricebookEntry WHERE Product2Id IN :idList];
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList = HF_ProductController.getWrappedPricebookEntries(pbList, productListToChange,10,'1');
        Test.stopTest();

        System.assertEquals(330000,pricebookEntryWrappedList[0].newPrice);
    }

    @IsTest
    static void shouldDecreaseOldPriceToNewPriceByPrecentage(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300000, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> productListToChange = [SELECT Id, Name, Pricebook2Id, Product2Id, UnitPrice, ProductCode FROM PricebookEntry WHERE Product2Id IN :idList];
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList = HF_ProductController.getWrappedPricebookEntries(pbList, productListToChange,10,'2');
        Test.stopTest();

        System.assertEquals(270000,pricebookEntryWrappedList[0].newPrice);
    }

    @IsTest
    static void shouldIncreaseOldPriceToNewPriceByAmount(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300000, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> productListToChange = [SELECT Id, Name, Pricebook2Id, Product2Id, UnitPrice, ProductCode FROM PricebookEntry WHERE Product2Id IN :idList];
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList = HF_ProductController.getWrappedPricebookEntries(pbList, productListToChange,10,'3');
        Test.stopTest();

        System.assertEquals(300010,pricebookEntryWrappedList[0].newPrice);
    }

    @IsTest
    static void shouldDecreaseOldPriceToNewPriceByAmount(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300000, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> productListToChange = [SELECT Id, Name, Pricebook2Id, Product2Id, UnitPrice, ProductCode FROM PricebookEntry WHERE Product2Id IN :idList];
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList = HF_ProductController.getWrappedPricebookEntries(pbList, productListToChange,10,'4');
        Test.stopTest();

        System.assertEquals(299990,pricebookEntryWrappedList[0].newPrice);
    }

    @IsTest
    static void shouldSetNewPriceWithGivenAmount(){
        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        String productRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

        Test.startTest();
        List<Product2> productList = HF_ProductController.getProductsNames(productRecordTypeId,pricebook.Id);

        List<Id> idList = new List<Id>();
        for(Product2 product : productList){
            idList.add(product.Id);
        }

        Pricebook2 standardPB = [SELECT Id FROM  Pricebook2 WHERE IsStandard=true];
        List<PricebookEntry> pbList= new List<PricebookEntry>();
        for(Product2 prod : productList){
            PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 300000, IsActive = true);
            pbList.add(standardPBE);
        }
        insert pbList;
        List<PricebookEntry> productListToChange = [SELECT Id, Name, Pricebook2Id, Product2Id, UnitPrice, ProductCode FROM PricebookEntry WHERE Product2Id IN :idList];
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> pricebookEntryWrappedList = HF_ProductController.getWrappedPricebookEntries(pbList, productListToChange,10,'5');
        Test.stopTest();

        System.assertEquals(10,pricebookEntryWrappedList[0].newPrice);
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