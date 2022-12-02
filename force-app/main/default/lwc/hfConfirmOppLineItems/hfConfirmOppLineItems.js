import { LightningElement,api,track, wire  } from 'lwc';
import getProductsNamesFromOppLineItem from '@salesforce/apex/HF_GetPricebooks.getProductsNamesFromOppLineItem';
import getOpportunityLineItems from '@salesforce/apex/HF_OpportunityController.getOpportunityLineItems';
import Product from '@salesforce/label/c.Product';
import Product_Code from '@salesforce/label/c.Product_Code';
import Quantity from '@salesforce/label/c.Quantity';
import Discount from '@salesforce/label/c.Discount';
import Total_Price from '@salesforce/label/c.Total_Price';

const columnLabel={
    Product,
    Product_Code,
    Quantity,
    Discount,
    Total_Price,
}
const columns = [
    { label: columnLabel.Product, fieldName: 'Name' },
    { label: columnLabel.Product_Code, fieldName: 'ProductCode' },
    { label: columnLabel.Quantity, fieldName: 'Quantity' ,type: 'number', },
    { label: columnLabel.Discount, fieldName: 'Discount' ,type: 'number',},
    { label: columnLabel.Total_Price, fieldName: 'TotalPrice' ,type: 'currency',
            typeAttributes: 
    {currencyCode: 'EUR', step: '0.01'}},
];

export default class HfConfirmOppLineItems extends LightningElement {
    @api oppLineItemsReadyToCreate;
    @api oppId;
    @api selectedPricebookEntriesToAdd;
    @track data;
    columns=columns;
    oppItemIdList = [];
    connectedCallback(){
        this.oppLineItemsReadyToCreate.forEach(item => {
            this.oppItemIdList.push(item);
        })
    }
}