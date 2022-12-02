import { LightningElement, track, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import checkIfInsertedDatesAreValid from '@salesforce/apex/HF_GetPricebooks.checkIfInsertedDatesAreValid'
import Pricebook_saved from '@salesforce/label/c.Pricebook_saved';
import Success from '@salesforce/label/c.Success';
import Error from '@salesforce/label/c.Error';
import Dates_incorrect from '@salesforce/label/c.Dates_incorrect';
import Close from '@salesforce/label/c.Close';
import Add_new_pricebook from '@salesforce/label/c.Add_new_pricebook';
import Product_Type from '@salesforce/label/c.Product_Type';
import Choose_product_type from '@salesforce/label/c.Choose_product_type';
import Cancel from '@salesforce/label/c.Cancel';
import OK from '@salesforce/label/c.OK';


export default class Hfaddpricebookmodal extends LightningElement {

    @api isModalOpen;
    @track isLoaded = false;
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
                 const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
             }

          }

    get options(){
      this.isLoaded=true;
        return [
                    { label: 'B2B', value: this.b2bRecordType },
                    { label: 'B2C', value: this.b2cRecordType },
                ];
    }
    label = {
        Pricebook_saved,
        Success,
        Error,
        Dates_incorrect,
        Close,
        Add_new_pricebook,
        Product_Type,
        Choose_product_type,
        Cancel,
        OK
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
                    title: this.label.Success,
                    message: this.label.Pricebook_saved,
                    variant: 'success',
                    mode: 'pester'
                });
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed");
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
                }
                else{
                    this.areDatesValid=true;
                }
           })
           .catch(error => {
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: this.label.Dates_incorrect+' '+error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
           })
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