public without sharing class HF_ProductController {

    @AuraEnabled
    public static List<Product2> getProductsNames(Id recordTypeId,Id pricebookId){
        try{
            return [SELECT Id,Name FROM Product2 WHERE RecordTypeId = :recordTypeId AND Id NOT IN
            (
                SELECT Product2Id FROM PricebookEntry WHERE Pricebook2Id = :pricebookId
            )];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<PricebookEntry> getSelectedProductsInfo(List<Id> selectedProductsList){
        try{
            String standardPB = System.Label.Standard_Price_Book;
            return [SELECT Id, Name, Product2Id, Product2.Name, Pricebook2Id, Pricebook2.Name, UnitPrice, ProductCode FROM PricebookEntry
                    WHERE Pricebook2.Name = :standardPB AND Product2Id IN  :selectedProductsList];
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<HF_PricebookEntryWrapper.PricebookEntryWrapped> getWrappedPricebookEntries(List<PricebookEntry> allSelectedProductsList,
            List<PricebookEntry> selectedProductsList, Double discount, String discountType){
        try{
        List<HF_PricebookEntryWrapper.PricebookEntryWrapped> wrapperList = new List<HF_PricebookEntryWrapper.PricebookEntryWrapped>();
        for(PricebookEntry allPricebookEntry : allSelectedProductsList) {
            HF_PricebookEntryWrapper.PricebookEntryWrapped pricebookEntryWrapped = new HF_PricebookEntryWrapper.PricebookEntryWrapped();
            pricebookEntryWrapped.Id = allPricebookEntry.Product2Id;
            pricebookEntryWrapped.productName = allPricebookEntry.Name;
            pricebookEntryWrapped.productCode = allPricebookEntry.ProductCode;
            pricebookEntryWrapped.oldPrice = allPricebookEntry.UnitPrice;
            pricebookEntryWrapped.newPrice = allPricebookEntry.UnitPrice;
            pricebookEntryWrapped.pricebookId = allPricebookEntry.Pricebook2Id;
            for (PricebookEntry pricebookEntry : selectedProductsList) {
                if (allPricebookEntry.Product2Id == pricebookEntry.Product2Id){
                    switch on discountType {
                        when '1' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice + (pricebookEntry.UnitPrice * discount * 0.01));
                        }
                        when '2' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice - (pricebookEntry.UnitPrice * discount * 0.01));
                        }
                        when '3' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice + discount);
                        }
                        when '4' {
                            pricebookEntryWrapped.newPrice = (pricebookEntry.UnitPrice - discount);
                        }
                        when '5' {
                            pricebookEntryWrapped.newPrice = discount;
                        }
                    }
                    break;
                }
            }
            wrapperList.add(pricebookEntryWrapped);
            }
        return wrapperList;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(Cacheable=true)
    public static Map<String,String> getUsersRoleOptions(){
        try{
            Map<String,String> optionMap = new Map<String,String>();
            String userRoleId = System.userInfo.getUserRoleId();
            UserRole userRole = [
                SELECT Id, Name, DeveloperName 
                FROM UserRole 
                WHERE Id = :userRoleId LIMIT 1];
            String userRoleName=userRole.Name;
            if( userRoleName.contains(System.Label.Housing) ){
                optionMap.put(System.Label.Anti_Theft_Door, 'Has_Anti_Theft_Door__c');
                optionMap.put(System.Label.Basement, 'Has_Basement__c');
                optionMap.put(System.Label.Garage, 'Has_Garage__c');
                optionMap.put(System.Label.Mortgage, 'Has_Mortgage__c');
                optionMap.put(System.Label.Swimming_Pool, 'Has_Swimming_Pool__c');
            }
            else if( UserRoleName.contains(System.Label.Business_Premises)){
                optionMap.put(System.Label.Openspace, 'Has_Openspace__c');
                optionMap.put(System.Label.Own_Bathroom, 'Has_Own_Bathroom__c');
                optionMap.put(System.Label.Parking_Lots, 'Has_Parking_Lots__c');
                optionMap.put(System.Label.Shop_Window, 'Has_Shop_Window__c');
                optionMap.put(System.Label.Storage_Room, 'Has_Storage_Room__c');
            }
            else if(userRoleName == System.Label.CEO){
                optionMap.put(System.Label.Anti_Theft_Door, 'Has_Anti_Theft_Door__c');
                optionMap.put(System.Label.Basement, 'Has_Basement__c');
                optionMap.put(System.Label.Garage, 'Has_Garage__c');
                optionMap.put(System.Label.Mortgage, 'Has_Mortgage__c');
                optionMap.put(System.Label.Swimming_Pool, 'Has_Swimming_Pool__c');
                optionMap.put(System.Label.Openspace, 'Has_Openspace__c');
                optionMap.put(System.Label.Own_Bathroom, 'Has_Own_Bathroom__c');
                optionMap.put(System.Label.Parking_Lots, 'Has_Parking_Lots__c');
                optionMap.put(System.Label.Shop_Window, 'Has_Shop_Window__c');
                optionMap.put(System.Label.Storage_Room, 'Has_Storage_Room__c');
            }
            return optionMap;
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Product2> searchForProducts(String inputName, List<String> pickedOptionsValuesList){
        try{
            String userRoleId = System.userInfo.getUserRoleId();
            UserRole userRole = [
                SELECT Id, Name, DeveloperName 
                FROM UserRole 
                WHERE Id = :userRoleId LIMIT 1];
            Id B2BRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2B').getRecordTypeId();
            Id B2CRecordTypeId = Schema.SObjectType.Product2.getRecordTypeInfosByName().get('B2C').getRecordTypeId();
            String query='';
            String userRoleName=userRole.Name;
            if( userRoleName.contains(System.Label.Housing) ){
                query += 'SELECT Id, Name, Main_Image__c,Has_Anti_Theft_Door__c,Has_Basement__c,Has_Garage__c,'+
                ' Has_Mortgage__c,Has_Swimming_Pool__c,Has_Openspace__c,Has_Own_Bathroom__c,Has_Parking_Lots__c,'+
                ' Has_Shop_Window__c,Has_Storage_Room__c FROM Product2 WHERE Id != null AND RecordTypeId = \''+B2CRecordTypeId+'\' ';
            }
            else if( UserRoleName.contains(System.Label.Business_Premises)){
                query += 'SELECT Id, Name, Main_Image__c,Has_Anti_Theft_Door__c,Has_Basement__c,Has_Garage__c,'+
                ' Has_Mortgage__c,Has_Swimming_Pool__c,Has_Openspace__c,Has_Own_Bathroom__c,Has_Parking_Lots__c,'+
                ' Has_Shop_Window__c,Has_Storage_Room__c FROM Product2 WHERE Id != null AND RecordTypeId = \''+B2BRecordTypeId+'\' ';
            }
            
            else if(userRoleName == System.Label.CEO){
                query += 'SELECT Id, Name, Main_Image__c,Has_Anti_Theft_Door__c,Has_Basement__c,Has_Garage__c,'+
                ' Has_Mortgage__c,Has_Swimming_Pool__c,Has_Openspace__c,Has_Own_Bathroom__c,Has_Parking_Lots__c,'+
                ' Has_Shop_Window__c,Has_Storage_Room__c FROM Product2 WHERE Id != null ';
            }

            if(String.isNotBlank(inputName)){
                query += ' AND Name LIKE \'%'+ String.escapeSingleQuotes(inputName) +'%\' ';
            }
            if(pickedOptionsValuesList.size() != 0){
                for(String field : pickedOptionsValuesList){
                    query += ' AND '+String.escapeSingleQuotes(field)+' = true ';
                }
            }

            return Database.query(query);
        }
        catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

}