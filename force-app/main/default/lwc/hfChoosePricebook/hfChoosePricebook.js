import { LightningElement,api, track,wire } from 'lwc';
import getPricebooksToChooseForOpportunity from '@salesforce/apex/HF_GetPricebooks.getPricebooksToChooseForOpportunity';
import getOpportunity from '@salesforce/apex/HF_OpportunityController.getOpportunity';
import getPricebookEntriesWithStandard from '@salesforce/apex/HF_GetPricebooks.getPricebookEntriesWithStandard';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import Price from '@salesforce/label/c.Price';
import Loading from '@salesforce/label/c.Loading';
import Available_Pricebooks from '@salesforce/label/c.Available_Pricebooks';
import Select_Pricebook from '@salesforce/label/c.Select_Pricebook';

const columnLabel = {
    Product,
    Product_Code,
    Price,
}
const columns = [
    { label: columnLabel.Product, fieldName: 'ProductName' },
    { label: columnLabel.Product_Code, fieldName: 'ProductCode' },
    { label: columnLabel.Price, fieldName: 'UnitPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} ,
        editable: true },
];
export default class HfChoosePricebook extends LightningElement {
    @track data;
    @track pricebookData;
    @api oppId;
    @api selectedPricebookRecordType;
    @api selectedPricebookRecordTypeName;
    @api selectedPricebookEntriesToAdd;
    @track oppRecordTypeId;
    @track options=[];
    columns = columns;
    value='';
    label = {
        Loading,
        Available_Pricebooks,
        Select_Pricebook
    }
    @wire (getObjectInfo, {objectApiName : PRICEBOOK_OBJECT} )
    productObjectInfo({data,error}){
            if(data){   
                this.data=data;
                const rtis = data.recordTypeInfos;
                let b2bRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2B');
                let b2cRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2C');
                getOpportunity({oppId : this.oppId})
                    .then(result => {
                        this.oppRecordType = result.RecordTypeId;
                        if(result.RecordType.Name == 'B2B'){
                            this.selectedPricebookRecordTypeName='B2B';
                            this.selectedPricebookRecordType=b2bRecordType;
                        }
                        else if(result.RecordType.Name == 'B2C'){
                            this.selectedPricebookRecordTypeName='B2C';
                            this.selectedPricebookRecordType=b2cRecordType;
                        }
                        this.getPricebooks(this.selectedPricebookRecordType, this.selectedPricebookRecordTypeName);
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
            else if(error){
                this.error = error;
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
            }
    }

    handleChange(event){
        this.value=event.detail.value;
        this.setDatatable(this.value,this.selectedPricebookRecordTypeName);
    }

    getPricebooks(pricebookRecordTypeId){
        getPricebooksToChooseForOpportunity({recordTypeId :  pricebookRecordTypeId})
            .then(result2 => {
                if(result2){
                    let options=[];
                    result2.forEach(pricebook => {
                        options.push({
                            label: pricebook.Name,
                            value: pricebook.Id
                    });
                    });
                    this.options=options;

                }
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

    get areOptionsFilled(){
        return (this.options != undefined && this.options != null && this.options.length > 0);
    }

    setDatatable(value,pricebookRecordTypeName){
        getPricebookEntriesWithStandard({pricebookId : value, recordTypeName : pricebookRecordTypeName})
            .then(result => {
                this.pricebookData = result.map(row => {
                    return {...row,ProductName : row.Product2.Name}
                });

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

    getSelected(event){
        const selectedRows = event.detail.selectedRows;
        this.selectedPricebookEntriesToAdd = selectedRows;
    }



}