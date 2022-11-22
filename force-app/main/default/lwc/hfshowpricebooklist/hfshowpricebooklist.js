import { LightningElement, wire, track, api } from 'lwc';
import getPricebooks from '@salesforce/apex/HF_GetPricebooks.getPricebooks';
import getPricebookEntries from '@salesforce/apex/HF_GetPricebooks.getPricebookEntries';
import deletePricebook from '@salesforce/apex/HF_GetPricebooks.deletePricebook';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';

//const pricebookEntries = [];
//const columns = [
//    {
//        label: 'Product',
//        fieldName: 'PricebookEntryName',
//        cellAttributes: { alignment: 'left' },
//        editable: true
//    },
//     { label: 'Product Code', fieldName: 'ProductCode'},
//     { label: 'Price', fieldName: 'UnitPrice' ,editable: true},
//     { label: 'Is Active', fieldName: 'IsActive' ,editable: true, type : 'boolean' },
//     { type: 'button-icon', initialWidth: 75,
//           typeAttributes: {
//               iconName: 'action:edit',
//               title: 'Edit pricebook',
//               variant: 'border-filled',
//               alternativeText: 'Edit'
//           }}
//];
//const value='';

export default class Hfshowpricebooklist extends LightningElement {
//    lookupIds = [];
    value='';

    b2bRecordType;
    b2cRecordType;
    @api isLoaded = false
    @track data;
    @track isSuccess;

    get setOptions() {
        return [
            {label: 'B2B', value: this.b2bRecordType},
            {label: 'B2C', value: this.b2cRecordType}
        ];
    }

    @api isModalOpen = false;

//    @wire (getPricebookEntries, {pricebookId : '$value'}) pricebookEntries (entries){
//        if(entries.data){
//            this.data = entries.data.map(row => {
//                return {...row,PricebookEntryName : row.Product2.Name}
//            })
//            this.error=undefined;
//        }
//        else if (entries.error) {
//             this.error = entries.error;
//             this.data = undefined;
//         }
//    }

    @wire (getObjectInfo, {objectApiName : PRICEBOOK_OBJECT} )
             objectInfo({data,error}){
                 if(data){
                     const rtis = data.recordTypeInfos;
                         let b2bRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2B');
                         let b2cRecordType =  Object.keys(rtis).find(rti => rtis[rti].name === 'B2C');
                         this.b2bRecordType = b2bRecordType;
                         this.b2cRecordType = b2cRecordType;
                         }
                 else if(error){
                     this.error = error;
                 }
              }

//    columns=columns;
    async pricebooksCallout(){
//        getPricebooks()
//            .then(result => {
//                for (var i = 0; i<result.length; i++){
//                    var pricebook = result[i];
//                    this.setOptions.push({label: pricebook.Name, value: pricebook.Id});
//
//                }
//                this.setOptions.sort((a,b)=> (a.label > b.label ? 1 : -1)) //For Ascending
//                this.setOptions = JSON.parse(JSON.stringify(this.setOptions));
//            });
    }

    connectedCallback(){
//        this.pricebooksCallout();
        this.isLoaded=true;

    }

    handleChange(event) {
        this.value = event.detail.value;
    }

    addNewPricebook(){
        this.openModal();
    }

//    refreshData(){
////        return this.template;
//    }

    openModal() {
        this.isModalOpen = true;
    }



}