import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import checkIfInsertedDatesAreValid from '@salesforce/apex/HF_GetPricebooks.checkIfInsertedDatesAreValid';
import Success from '@salesforce/label/c.Success';
import Close from '@salesforce/label/c.Close';
import Cancel from '@salesforce/label/c.Cancel';
import OK from '@salesforce/label/c.OK';
import Edit_pricebook from '@salesforce/label/c.Edit_pricebook'
import Dates_incorrect from '@salesforce/label/c.Dates_incorrect';
import Pricebook_saved from '@salesforce/label/c.Pricebook_saved';
import Error from '@salesforce/label/c.Error';

export default class HfShowEditPricebookModal extends LightningElement {
    @api row;
    @api editPricebookClicked;
    @api refreshedPricebooks;
    closeClicked;
    inputName;
    inputStart;
    inputEnd;
    isBeingFilled;

    label={
        Close,
        Edit_pricebook,
        Cancel,
        OK,
        Dates_incorrect,
        Pricebook_saved,
        Success,
        Error
    }
    get isAnyDataIncorrect(){
        return (this.isBeingFilled == false || this.areDatesValid == false);
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

    handleChange(event){
       const sendEvent = new CustomEvent("sendeditflag", {
           detail: this.editPricebookClicked
       });
       this.dispatchEvent(sendEvent);
    }

    areDatesValid=true;

    handleValidity(){
        this.inputStart = this.template.querySelector('.startDate').value;
        this.inputEnd = this.template.querySelector('.endDate').value;
       checkIfInsertedDatesAreValid({startDate : this.inputStart, endDate : this.inputEnd, recordTypeId : this.row.RecordTypeId})
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
           });
    }



    closeModal() {
        this.editPricebookClicked = false;
        this.closeClicked = true;
         const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
             detail : this.closeClicked
         });
         this.dispatchEvent(sendCloseInfoEvent);
    }

    closeModalWithMessage(){
        this.editPricebookClicked = false;
        this.closeClicked = true;
        refreshApex(this.refreshedPricebooks);
        const evt = new ShowToastEvent({
                    title: this.label.Success,
                    message: this.label.Pricebook_saved,
                    variant: 'success',
                    mode: 'pester'
                });
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
            detail : this.closeClicked
        });
         this.dispatchEvent(sendCloseInfoEvent);
        this.dispatchEvent(evt);
    }
}