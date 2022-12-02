import { LightningElement,api,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import getProductsNames from '@salesforce/apex/HF_ProductController.getProductsNames'
import addPricebookEntries from '@salesforce/apex/HF_GetPricebooks.addPricebookEntries'
import getSelectedProductsInfo from '@salesforce/apex/HF_ProductController.getSelectedProductsInfo'
import getWrappedPricebookEntries from '@salesforce/apex/HF_ProductController.getWrappedPricebookEntries'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import Price from '@salesforce/label/c.Price';
import Old_Price from '@salesforce/label/c.Old_Price';
import New_Price from '@salesforce/label/c.New_Price';
import B2B from '@salesforce/label/c.B2B';
import B2C from '@salesforce/label/c.B2C';
import Price_increase_percent from '@salesforce/label/c.Price_increase_percent';
import Price_decrease_percent from '@salesforce/label/c.Price_decrease_percent';
import Price_increase_value from '@salesforce/label/c.Price_increase_value';
import Price_decrease_value from '@salesforce/label/c.Price_decrease_value';
import Price_change_value from '@salesforce/label/c.Price_change_value';
import Pricebook_saved from '@salesforce/label/c.Pricebook_saved';
import Success from '@salesforce/label/c.Success';
import Products from '@salesforce/label/c.Products';
import Available from '@salesforce/label/c.Available';
import Selected from '@salesforce/label/c.Selected';
import Add_Products_Info from '@salesforce/label/c.Add_Products_Info';
import Cancel from '@salesforce/label/c.Cancel';
import OK from '@salesforce/label/c.OK';
import Next from '@salesforce/label/c.Next';
import Done from '@salesforce/label/c.Done';
import Back from '@salesforce/label/c.Back';
import Summary from '@salesforce/label/c.Summary';
import Input_price_change from '@salesforce/label/c.Input_price_change';
import Input_price_change_placeholder from '@salesforce/label/c.Input_price_change_placeholder';
import Pick_price_change_type from '@salesforce/label/c.Pick_price_change_type';
import Pick_products_title from '@salesforce/label/c.Pick_products_title';
import Browse_products from '@salesforce/label/c.Browse_products';
import Add_Products from '@salesforce/label/c.Add_Products';
import Add_Products_to_pricebook from '@salesforce/label/c.Add_Products_to_pricebook';

const label2 = {
    Product,
    Product_Code,
    Price,
    Old_Price,
    New_Price,
}
const columns = [
    { label: label2.Product, fieldName: 'Name' },
    { label: label2.Product_Code, fieldName: 'ProductCode' },
    { label: label2.Price, fieldName: 'UnitPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
];

const finalColumns = [
    { label: label2.Product, fieldName: 'productName' },
    { label: label2.Product_Code, fieldName: 'productCode' },
    { label: label2.Old_Price, fieldName: 'oldPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
    { label: label2.New_Price, fieldName: 'newPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
];

export default class HfShowAddPricebookEntriesModal extends LightningElement {
    @api addProductClicked = false;
    @api nextClicked = false;
    @api nextNextClicked = false;
    @api selectedPricebookRecordTypeId;
    @api row;
    @api value;
    @api refreshedPricebookEntries;
    @track data;
    @track finalData;
    @track options = [];
    @track selectedListOnPriceChangeModal=[];
    refreshedOptions;
    areProductsAdded=false;
    @track pickedPriceChangeType;
    @api refreshedPricebooks;
    closeClicked;
    productObjectInfo;
    @track discount = 0;
    @api selectedProductRecordType;

    columns=columns;
    finalColumns=finalColumns;
    label = {
        Product,
        Product_Code,
        Price,
        Old_Price,
        New_Price,
        B2B,
        B2C,
        Price_increase_percent,
        Price_decrease_percent,
        Price_increase_value,
        Price_decrease_value,
        Price_change_value,
        Pricebook_saved,
        Success,
        Products,
        Available,
        Selected,
        Add_Products_Info,
        Cancel,
        OK,
        Done,
        Next,
        Back,
        Summary,
        Input_price_change,
        Input_price_change_placeholder,
        Pick_price_change_type, 
        Pick_products_title,
        Browse_products,
        Add_Products,
        Add_Products_to_pricebook

    }
    @wire (getObjectInfo, {objectApiName : PRODUCT_OBJECT} )
         productObjectInfo({data,error}){
             if(data){
                 this.data=data;
                 const rtis = data.recordTypeInfos;
                     let b2bRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === this.label.B2B);
                     let b2cRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === this.label.B2B);
                     if(this.row.RecordType.Name == this.label.B2B){
                         this.selectedProductRecordType = b2bRecordType;
                     }
                      else if(this.row.RecordType.Name == this.label.B2B){
                          this.selectedProductRecordType = b2cRecordType;
                      }
                    getProductsNames({recordTypeId : this.selectedProductRecordType, pricebookId : this.row.Id})
                      .then(result => {
                        this.refreshedOptions=result;
                        if(result){
                            result.forEach(product => {
                                this.options.push({
                                    label: product.Name,
                                    value: product.Id
                            });
                            });
                        }
                      });

             }
             else if(error){

                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);

             }
          }


    get priceChangeOptions(){
        return [
                    {label: this.label.Price_increase_percent, value: '1'},
                    {label: this.label.Price_decrease_percent, value: '2'},
                    {label: this.label.Price_increase_value, value: '3'},
                    {label: this.label.Price_decrease_value, value: '4'},
                    {label: this.label.Price_change_value, value: '5'}
                ];
    }


    get firstPage(){
        return (this.addProductClicked == true && this.nextClicked == false && this.nextNextClicked == false);
    }

    get secondPage(){
        return (this.addProductClicked == true && this.nextClicked == true && this.nextNextClicked == false);
    }

    get thirdPage(){
        return (this.addProductClicked == true && this.nextClicked == false && this.nextNextClicked == true);
    }

    showSelectedProducts(){
        getSelectedProductsInfo({selectedProductsList : this.uniqueSelected})
            .then( result => {
                this.data = result;
            })
            .catch(error => {
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
           })
    }

    showFinalSelectedProducts(selectedList){
        getSelectedProductsInfo({selectedProductsList : selectedList})
            .then( result => {
                var tmpList = [];
                for(var i = 0 ; i< result.length; i++){
                    tmpList.push(result[i]);
                }
                 getWrappedPricebookEntries({allSelectedProductsList : this.data, selectedProductsList : tmpList, discount : this.discount,
                                                discountType: this.pickedPriceChangeType})
                        .then (finalResult => {
                            this.finalData=finalResult;
                        })
                        .catch(error => {
                            const evt = new ShowToastEvent({
                                title: this.label.Error,
                                message: error.body.message,
                                variant: 'error'
                            });
                            this.dispatchEvent(evt);
                       })
            })
            .catch(error => {
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
           })

    }

    manipulateSelectedProducts(){
        var idListToChange = [];
        var selectedRecords = this.template.querySelector("lightning-datatable").getSelectedRows();
        for( var i = 0; i<selectedRecords.length; i++ ){
            idListToChange.push(selectedRecords[i].Product2Id);
        }
        this.showFinalSelectedProducts(idListToChange);
    }

    selected=[];
    uniqueSelected = [];

    handleChange(event) {
        this.selected = event.detail.value;
    }
    handleDiscountInput(event){
        this.discount=event.detail.value;
    }

    handlePriceChange(event){
        this.pickedPriceChangeType = event.detail.value;
    }

    goToAnotherModalPage(){
        this.uniqueSelected = [...new Set(this.selected)];
        this.nextClicked=true;
        this.nextNextClicked=false;
        this.showSelectedProducts();
    }

    goBack(){
        this.selected=[];
        this.uniqueSelected=[];
        this.nextClicked=false;
        this.nextNextClicked=false;
    }
    get ifSelectedIsEmpty(){
        return this.selected.length==0;
    }

    addToList(event){
        this.selectedListOnPriceChangeModal=event.detail.selectedRows;
    }
    
    get IsListEmpty(){
        return this.selectedListOnPriceChangeModal.length==0;
    }

    goBackToPriceChange(){
        this.nextClicked=true;
        this.nextNextClicked=false;
    }

    goToSummaryPage(){
        this.uniqueSelected = [...new Set(this.selected)];
        this.nextClicked=false;
        this.nextNextClicked=true;
        this.manipulateSelectedProducts();
    }

    handleDoneButton(){
        this.addProductClicked = false;
        this.nextNextClicked=false;
        this.nextClicked=false;
        this.closeClicked = true;

        addPricebookEntries({pricebookEntryWrappedList : this.finalData, pricebookId : this.row.Id})
        .then (result => {
            this.areProductsAdded=true;
            const evt = new ShowToastEvent({
                        title: this.label.Success,
                        message: this.label.Pricebook_saved,
                        variant: 'success',
                        mode: 'pester'
                    });
            const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                                 detail : this.closeClicked
                     });
            this.dispatchEvent(
                new CustomEvent ("productsaddition",{
                    detail : this.areProductsAdded
                })
            )

             this.dispatchEvent(sendCloseInfoEvent);
            this.dispatchEvent(evt);
            refreshApex(this.refreshedPricebooks);
            refreshApex(this.refreshedPricebookEntries);
            this.selected=[];
            this.uniqueSelected=[];
        })
        .catch(error => {
            const evt = new ShowToastEvent({
                title: this.label.Error,
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(evt);
       })

    }

    closeModal() {
        this.addProductClicked = false;
        this.nextClicked=false;
        this.nextNextClicked=false;
        this.closeClicked = true;
        this.areProductsAdded=false;
        this.selected=[];
        this.uniqueSelected=[];
         const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                     detail : this.closeClicked
                 });
         this.dispatchEvent(sendCloseInfoEvent);
    }
}