import { LightningElement,wire,api,track } from 'lwc';
import contentImages from  '@salesforce/apex/HF_GalleryProductService.contentImages';
import setMainImage from  '@salesforce/apex/HF_GalleryProductService.setMainImage';
import MAIN_IMAGE from '@salesforce/schema/Product2.Main_Image__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Close from '@salesforce/label/c.Close';
import Set_as_Main_Image from '@salesforce/label/c.Set_as_Main_Image';
import Loading from '@salesforce/label/c.Loading';
import Previous from '@salesforce/label/c.Previous';
import Next from '@salesforce/label/c.Next';
import Success from '@salesforce/label/c.Success';
import Cancel from '@salesforce/label/c.Cancel';
import Main_image_updated from '@salesforce/label/c.Main_image_updated';


const fields = [MAIN_IMAGE];

export default class HfPhotoGalleryProduct extends LightningElement {

    @wire(getRecord, { recordId: '$recordId', fields }) product;
    label = {
        Close,
        Set_as_Main_Image,
        Loading,
        Previous,
        Next,
        Success,
        Main_image_updated,  
        Cancel
    }
    isLoaded = false;
    imageMain;

    @api
    get mainImageUrl() {
        if(this.imageMain){
            const value = getFieldValue(this.product.data, this.imageMain);
            return this.imageMain;
        }else{
            const value = getFieldValue(this.product.data, MAIN_IMAGE);
            return value;
        }
    }

    wiredContentImages;
    @api recordId;

    retrievedRecordId = false;

    renderedCallback() {
          if (!this.retrievedRecordId && this.recordId) {
                  this.retrievedRecordId = true;
                  this.getDocuments();
              }
      }

    getDocuments() {
        contentImages({recordId: this.recordId})
            .then(result => {
                this.wiredContentImages = result;
            })
            .catch(error => {
                const evt = new ShowToastEvent({
                    title: this.label.Error,
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
           })
    }

    clickedImageId;

    handleImage(event) {
        event.preventDefault();
        const id = event.target.dataset.id;
        this.clickedImageId = '/sfc/servlet.shepherd/document/download/' + id;
        this.isShowModal = true;
    }


    set mainImageUrl(value) {
        this.clickedImageId = value;
    }

    mainPhoto;
    setMainPhoto() {
        setMainImage({
            mainImage: this.clickedImageId,
            recordId: this.recordId
        })
        this.imageMain = this.clickedImageId;
        this.isShowModal = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.label.Success,
                message: this.label.Main_image_updated,
                variant: 'success'
            })
        );
    }

    get wiredCon() {
        let value = [];
        if(this.wiredContentImages.length >2){
            for(let i = this.start; i <this.end; i++) {
                value.push(this.wiredContentImages[i]);
            }
        }
        else{
            for(let i = 0; i <this.wiredContentImages.length; i++) {
                value.push(this.wiredContentImages[i]);
            }
        }
       return value;
    }

    end = 3;
    start = 0;
    goNext(event){
        if(this.end < this.wiredContentImages.length){
            this.start = this.start + 3;
                if(this.end + 3 < this.wiredContentImages.length){
                this.end = this.end + 3;
                }else{
                    this.end = this.wiredContentImages.length;
                }
        }
        event.preventDefault();
    }

    goPrev(event){
        if(this.start >  0){
            this.start = this.start - 3;
                if(this.end == this.wiredContentImages.length) {
                    this.end = this.start + 3;
                }else{
                this.end = this.end - 3;
                }
        }
        event.preventDefault();
    }

    handleLoad() {
        this.isLoaded = false;
    }

    isShowModal = false;

    showModal() {
        this.isShowModal = true;
    }
    hideModal() {
        this.isShowModal = false;
    }
}