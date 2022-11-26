import { LightningElement, wire, track, api } from 'lwc';
import getPricebooks from '@salesforce/apex/HF_GetPricebooks.getPricebooks';
import getPricebookEntries from '@salesforce/apex/HF_GetPricebooks.getPricebookEntries';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';


export default class Hfshowpricebooklist extends LightningElement {
    value='';
    @track addProductClicked=false;
    b2bRecordType;
    b2cRecordType;
    @track isLoaded = false
    @track data;
    @track isSuccess;
    refreshed;

    get setOptions() {
        return [
            {label: 'B2B', value: this.b2bRecordType},
            {label: 'B2C', value: this.b2cRecordType}
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
                 }
              }


    connectedCallback(){
        this.isLoaded=true;
    }

    getRefreshedTable(event){
        this.refreshed=event.detail;
        console.log('refreshed values: '+this.refreshed);
    }

    getAddPricebookModalFlag(event){
       this.isModalOpen=event.detail.value;
       if(this.isModalOpen == false){
           const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                          detail: this.isModalOpen
                      });
            this.dispatchEvent(sendCloseInfoEvent);
       }
//       refreshApex(refreshed);
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

//    handleRecordSavedRefresh(event){
//        this.refreshed=event.detail;
//        console.log(this.refreshed);
//    }

    addNewPricebook(){
        this.openModal();


    }

    openModal() {
        this.isModalOpen = true;
    }



}