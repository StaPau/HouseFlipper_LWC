import { LightningElement, api,track, wire } from 'lwc';
import getWrappedPricebookEntriesToOppLineItem from '@salesforce/apex/HF_GetPricebooks.getWrappedPricebookEntriesToOppLineItem';
import getNewOpportunityLineItemList from '@salesforce/apex/HF_GetPricebooks.getNewOpportunityLineItemList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import List_Price from '@salesforce/label/c.List_Price';
import Quantity from '@salesforce/label/c.Quantity';
import Discount from '@salesforce/label/c.Discount';
import Success from '@salesforce/label/c.Success';
import Pricebook_entry_updated from '@salesforce/label/c.Pricebook_entry_updated';

const columnLabel = {
    Product,
    Product_Code,
    List_Price,
    Quantity,
    Discount,
}
const columns=[
    { label: columnLabel.Product, fieldName: 'productName' , },
    { label: columnLabel.Product_Code, fieldName: 'productCode' , },
    { label: columnLabel.List_Price, fieldName: 'listPrice' ,type: 'currency',
        typeAttributes: 
        {currencyCode: 'EUR', step: '0.01'} 
    },
    { label: columnLabel.Quantity, fieldName: 'quantity' ,type: 'number', },
    { label: columnLabel.Discount, fieldName: 'discount' ,type: 'number', editable : true},

];

export default class HfAddToOppLineItems extends LightningElement {
    @api oppId;
    @api selectedPricebookEntriesToAdd; 
    @api oppLineItemsReadyToCreate;
    @track data;
    draftValues = [];
    columns=columns;
    label = {
        Success,
        Pricebook_entry_updated,
    }
    @track inputDiscount=0;


    @wire (getWrappedPricebookEntriesToOppLineItem,{  
         pricebookEntryList : '$selectedPricebookEntriesToAdd',
         inputQuantity : 1,
         inputDiscount : '$inputDiscount'
        }) 
        getWrappedPricebookEntries (result){
            if(result.data){
                this.data=result.data.map(row => {
                    return {...row,ProductName : row.productName}
                });
            }
            else if(result.error){
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: result.error.body.message,
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
            this.data.forEach(row => {
                if(row.Id == record.fields.Id){
                    row.discount=record.fields.discount
                }
            })
        );

        this.draftValues = [];
        getNewOpportunityLineItemList({wrappedList: this.data, oppId : this.oppId})
            .then(result => {
                console.log(JSON.stringify(result));
                this.oppLineItemsReadyToCreate = result;

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
                    message: error.body,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
           })

    }

        
    


}