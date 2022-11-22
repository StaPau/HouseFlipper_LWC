import { LightningElement, track, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Hfaddpricebookmodal extends LightningElement {
    @api isModalOpen;
    @api isLoaded = false;
    @api isSuccess;

    @track inputName;


    objectApiName;
    objectInfo;
    b2bRecordType;
    b2cRecordType;
    isBeingFilled=false;
    isLoading = true;
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
    }

    handleChange(event){
        const selectedOption = event.detail.value;
        this.pickedType = selectedOption;
    }

    async closeModalWithMessage(){
        this.isModalOpen = false;
        const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Price book has been saved successfully.',
                    variant: 'success',
                    mode: 'pester'
                });
        this.dispatchEvent(evt);
        console.log('isModalOpen: '+this.isModalOpen);
        //TODO: refresh parent here
          this.dispatchEvent(
                new CustomEvent('recordsaved')
          );

    }

     get isAnyDataIncorrect(){
        return (this.pickedType == '' || this.isBeingFilled == false );
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