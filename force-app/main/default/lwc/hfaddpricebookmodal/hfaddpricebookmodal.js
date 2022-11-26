import { LightningElement, track, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import checkIfInsertedDatesAreValid from '@salesforce/apex/HF_GetPricebooks.checkIfInsertedDatesAreValid'


export default class Hfaddpricebookmodal extends LightningElement {
    @api isModalOpen;
    @track isLoaded = false;
    @api isSuccess;
    @api refreshedPricebooks;
    @track inputName;
    inputStart;
    inputEnd;
    objectApiName;
    objectInfo;
    b2bRecordType;
    b2cRecordType;
    isBeingFilled=false;
    @track pickedType='';
    value=undefined;
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

    get options(){
      this.isLoaded=true;
        return [
                    { label: 'B2B', value: this.b2bRecordType },
                    { label: 'B2C', value: this.b2cRecordType },
                ];
    }

    connectedCallback(){
        this.isLoaded=true;
    }

    closeModal() {
        this.isModalOpen = false;
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                       detail: this.isModalOpen
                   });
         this.dispatchEvent(sendCloseInfoEvent);
    }

    handleChange(event){
        const selectedOption = event.detail.value;
        this.pickedType = selectedOption;

    }

    hideSpinner(){
        this.isLoaded=false;
    }
    closeModalWithMessage(){
        this.isModalOpen = false;
        refreshApex(this.refreshedPricebooks);
        const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Pricebook has been saved successfully.',
                    variant: 'success',
                    mode: 'pester'
                });
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
            detail: this.isModalOpen
        });
         this.dispatchEvent(sendCloseInfoEvent);
        this.dispatchEvent(evt);
    }

    get isAnyDataIncorrect(){
        return (this.pickedType == '' || this.isBeingFilled == false || this.areDatesValid == false || this.inputStart == null || this.inputEnd == null );
    }

    areDatesValid=true;

    handleValidity(){
        this.inputStart = this.template.querySelector('.startDate').value;
        this.inputEnd = this.template.querySelector('.endDate').value;
       checkIfInsertedDatesAreValid({startDate : this.inputStart, endDate : this.inputEnd, recordTypeId : this.pickedType})
           .then(result => {
                if(result != ''){
                    this.areDatesValid=false;
                    const evt = new ShowToastEvent({
                               title: 'Error',
                               message: 'Dates incorrect! '+result,
                               variant: 'error'
                           });
                    this.dispatchEvent(evt);
                }
                else{
                    this.areDatesValid=true;
                }
           });
    }

    setAsFilled(event){
        var value = event.target.value;
        if(value == null || value == ''){
            this.isBeingFilled=false;
        }
        else{
            this.isBeingFilled=true;
        }
    }

}