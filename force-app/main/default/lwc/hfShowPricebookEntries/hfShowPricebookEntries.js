import { LightningElement,api,wire,track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import getPricebookEntries from '@salesforce/apex/HF_GetPricebooks.getPricebookEntries';
import Close from '@salesforce/label/c.Close';
import Pricebook_entries from '@salesforce/label/c.Pricebook_entries';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import Price from '@salesforce/label/c.Price';
import Pricebook_entry_updated from '@salesforce/label/c.Pricebook_entry_updated';
import Success from '@salesforce/label/c.Success';

const label2={
    Product,
    Product_Code,
    Price,
}
const columns = [
    { label: label2.Product, fieldName: 'ProductName' },
    { label: label2.Product_Code, fieldName: 'ProductCode' },
    { label: label2.Price, fieldName: 'UnitPrice' , type: 'currency',
        typeAttributes: {currencyCode: 'EUR', step: '0.01'} ,
        editable: true },
];

export default class HfShowPricebookEntries extends LightningElement {
    @api row;
    @api viewProductsClicked=false;
    @api recordId;
    closeClicked=false;
    @track data;
    refreshedPricebookEntries;
    @api refreshedPricebooks;
    @api areProductsAdded;
    columns=columns;
    draftValues = [];
    label={
        Close,
        Pricebook_entries,
        Pricebook_entry_updated,
        Success
    }
    @wire
    (getPricebookEntries, {pricebookId: '$row.Id'}) pricebookEntries(result){
        this.refreshedPricebookEntries=result;
        this.data=result.data;
        if(result.data){
            this.data = result.data.map(row => {
                return {...row,ProductName : row.Product2.Name}
            });
            this.data.sort((a,b)=> (a.Name > b.Name ? 1 : -1))
            this.error=undefined;
            if(this.areProductsAdded){
                refreshApex(this.refreshedPricebookEntries);
            }
        }
        else if (result.error) {
             this.error = result.error;
             this.data = undefined;
            const evt = new ShowToastEvent({
                title: this.label.Error,
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(evt);
         }

    }

    async handleSave(event){
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });
        this.draftValues = [];
        const recordUpdatePromises = records.map((record) =>
            updateRecord(record)
        );
        Promise.all(recordUpdatePromises)
            .then( res => {
                this.draftValues = [];
                refreshApex(this.refreshedPricebookEntries);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.label.Success,
                        message: this.label.Pricebook_entry_updated,
                        variant: 'success'
                    })
                );
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

    closeModal(){
        this.viewProductsClicked = false;
        this.closeClicked = true;
         const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
             detail : this.closeClicked
         });
         this.dispatchEvent(sendCloseInfoEvent);
    }

}