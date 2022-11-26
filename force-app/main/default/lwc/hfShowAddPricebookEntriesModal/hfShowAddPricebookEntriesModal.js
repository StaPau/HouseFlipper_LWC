
import { LightningElement,api,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getProductsNames from '@salesforce/apex/HF_ProductController.getProductsNames'
import addPricebookEntries from '@salesforce/apex/HF_GetPricebooks.addPricebookEntries'
import getSelectedProductsInfo from '@salesforce/apex/HF_ProductController.getSelectedProductsInfo'
import getWrappedPricebookEntries from '@salesforce/apex/HF_ProductController.getWrappedPricebookEntries'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';

const columns = [
    { label: 'Product', fieldName: 'Name' },
    { label: 'Product Code', fieldName: 'ProductCode' },
    { label: 'Price', fieldName: 'UnitPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
];

const finalColumns = [
    { label: 'Product', fieldName: 'productName' },
    { label: 'Product Code', fieldName: 'productCode' },
    { label: 'Old Price', fieldName: 'oldPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
    { label: 'New Price', fieldName: 'newPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} },
];

export default class HfShowAddPricebookEntriesModal extends LightningElement {
    @api addProductClicked = false;
    @api nextClicked = false;
    @api nextNextClicked = false;
    @api selectedPricebookRecordTypeId;
    @api row;
    @api value;
    @track data;
    @track finalData;
    @track options = [];
    @track pickedPriceChangeType;

    productObjectInfo;
    @track discount = 0;
    @api selectedProductRecordType;

    columns=columns;
    finalColumns=finalColumns;


    @wire (getObjectInfo, {objectApiName : PRODUCT_OBJECT} )
         productObjectInfo({data,error}){
             if(data){
                 this.data=data;
                 const rtis = data.recordTypeInfos;
                     let b2bRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2B');
                     let b2cRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2C');
                     if(this.row.RecordType.Name == 'B2B'){
                         this.selectedProductRecordType = b2bRecordType;
                     }
                      else if(this.row.RecordType.Name == 'B2C'){
                          this.selectedProductRecordType = b2cRecordType;
                      }
                      console.log(this.selectedProductRecordType);
                      this.populateOptions();

             }
             else if(error){
                 this.error = error;
             }
          }



        get priceChangeOptions(){
            return [
                       {label: 'Price increase [%]', value: '1'},
                       {label: 'Price decrease [%]', value: '2'},
                       {label: 'Price increase [€]', value: '3'},
                       {label: 'Price decrease [€]', value: '4'},
                       {label: 'Set price [€]', value: '5'}
                   ];
        }


    populateOptions(){
        getProductsNames({recordTypeId : this.selectedProductRecordType, pricebookId : this.row.Id})
            .then(result => {
                for(var i = 0; i< result.length; i++){
                     this.options.push({
                        label: result[i].Name,
                        value: result[i].Id
                    });
                }
                this.options = JSON.parse(JSON.stringify(this.options));
            });
    }


//    getWrappedPricebookEntries({selectedProductsList : result, discount : this.discount})
//                    .then (finalResult => {
//                        this.data=finalResult;
//                    })

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
            });
    }

    showFinalSelectedProducts(selectedList){
        getSelectedProductsInfo({selectedProductsList : selectedList})
            .then( result => {
                console.log(JSON.stringify(result));
                var tmpList = [];
                for(var i = 0 ; i< result.length; i++){
                    tmpList.push(result[i]);
                }
                 getWrappedPricebookEntries({allSelectedProductsList : this.data, selectedProductsList : tmpList, discount : this.discount,
                                                discountType: this.pickedPriceChangeType})
                        .then (finalResult => {
                            console.log(JSON.stringify(finalResult));
                            this.finalData=finalResult;
                        })
            });

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
        this.addingPricebookAfterClick();
        console.log(this.addProductClicked);
        const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Pricebook has been saved successfully.',
                    variant: 'success',
                    mode: 'pester'
                });
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                             detail : this.addProductClicked
                 });
         this.dispatchEvent(sendCloseInfoEvent);
        this.dispatchEvent(evt);

    }

    addingPricebookAfterClick(){
        addPricebookEntries({pricebookEntryWrappedList : this.finalData, pricebookId : this.row.Id})
            .then (result => {
                console.log(JSON.stringify(this.finalData));
                console.log(JSON.stringify(result));
            });
    }

    closeModal() {
        this.addProductClicked = false;
        this.nextClicked=false;
        this.nextNextClicked=false;
        this.selected=[];
        this.uniqueSelected=[];
         const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                     detail : this.addProductClicked
                 });
         this.dispatchEvent(sendCloseInfoEvent);
    }
}