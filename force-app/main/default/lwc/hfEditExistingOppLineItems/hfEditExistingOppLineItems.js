import { LightningElement,api,track,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getOpportunityLineItems from '@salesforce/apex/HF_OpportunityController.getOpportunityLineItems';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import List_Price from '@salesforce/label/c.List_Price';
import Quantity from '@salesforce/label/c.Quantity';
import Discount from '@salesforce/label/c.Discount';
import Success from '@salesforce/label/c.Success';
import Pricebook_entry_updated from '@salesforce/label/c.Pricebook_entry_updated';
import Sales_Price from '@salesforce/label/c.Sales_Price';



const columnLabel = {
    Product,
    Product_Code,
    List_Price,
    Quantity,
    Discount,
    Sales_Price
}
const columns=[
    
    { label: columnLabel.Product, fieldName: 'Name' ,},
    { label: columnLabel.Product_Code, fieldName: 'ProductCode',},
    { label: columnLabel.List_Price, fieldName: 'UnitPrice' ,type: 'currency', editable : true,
        typeAttributes: 
        {currencyCode: 'EUR', step: '0.01'} 
    },
    { label: columnLabel.Quantity, fieldName: 'Quantity' ,type: 'number', },
    { label: columnLabel.Discount, fieldName: 'Discount' ,type: 'number', editable : true},
    { label: 'Total Price', fieldName: 'TotalPrice' ,type: 'currency',
        typeAttributes: 
        {currencyCode: 'EUR', step: '0.01'} },

];
export default class HfEditExistingOppLineItems extends LightningElement {
    @api oppLineItems;
    @api oppId;
    @track data=[];

    draftValues = [];
    label = {
        Success,
        Pricebook_entry_updated
    }
    columns=columns;

    connectedCallback(){
        let temp=[];
        for(var i = 0; i< this.oppLineItems.length; i++){
            temp.push({...this.oppLineItems}[i]);
        }
        this.data=temp;
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
                getOpportunityLineItems({oppId: this.oppId})
                    .then(result=>{
                        this.data=result;
                        this.data=result.map(row => {
                            return {...row,Name : row.Product2.Name}
                        });
                        this.draftValues = [];
                        refreshApex(this.data);
                        
                    })
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