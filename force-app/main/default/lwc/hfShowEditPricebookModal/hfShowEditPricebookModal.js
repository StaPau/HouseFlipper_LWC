import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import checkIfInsertedDatesAreValid from '@salesforce/apex/HF_GetPricebooks.checkIfInsertedDatesAreValid'

export default class HfShowEditPricebookModal extends LightningElement {
    @api row;
    @api editPricebookClicked;
    @api refreshedPricebooks;
    closeClicked;
    inputName;
    inputStart;
    inputEnd;
    isBeingFilled;

    get isAnyDataIncorrect(){
        return (this.isBeingFilled == false || this.areDatesValid == false || this.inputStart == null || this.inputEnd == null);
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
               console.log(result);
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
                    title: 'Success',
                    message: 'Pricebook has been saved successfully.',
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