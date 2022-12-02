import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import Add_new_pricebook from '@salesforce/label/c.Add_new_pricebook';
import Pricebooks from '@salesforce/label/c.Pricebooks';
import Select_Pricebook from '@salesforce/label/c.Select_Pricebook';
import B2B from '@salesforce/label/c.B2B';
import B2C from '@salesforce/label/c.B2C';
import Loading from '@salesforce/label/c.Loading';

export default class Hfshowpricebooklist extends LightningElement {
    value='';
    @track addProductClicked=false;
    b2bRecordType;
    b2cRecordType;
    @track isLoaded = false
    @track data;
    @track isSuccess;
    refreshed;
    label = {
        Add_new_pricebook,
        Pricebooks,
        Select_Pricebook,
        B2B,
        B2C,
        Loading
    }
    get setOptions() {
        return [
            {label: this.label.B2B, value: this.b2bRecordType},
            {label: this.label.B2C, value: this.b2cRecordType}
        ];
    }

    @track isModalOpen = false;

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
                    const evt = new ShowToastEvent({
                        title: this.label.Error,
                        message: error.body.message,
                        variant: 'error'
                    });
                    this.dispatchEvent(evt);
                 }
              }


    connectedCallback(){
        this.isLoaded=true;
    }

    getRefreshedTable(event){
        this.refreshed=event.detail;
        this.isModalOpen=false;
    }

    getAddPricebookModalFlag(event){
        this.refreshed=event.detail;

        this.isModalOpen=false;
        refreshApex(this.refreshed);
    }

    handleChange(event) {
        this.value = event.detail.value;
    }


    addNewPricebook(){
        this.isModalOpen = true;
    }



}