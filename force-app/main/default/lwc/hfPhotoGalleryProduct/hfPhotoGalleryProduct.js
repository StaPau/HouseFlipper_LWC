import { LightningElement,wire,api,track } from 'lwc';
import contentImages from  '@salesforce/apex/HF_GalleryProductService.contentImages';
import setMainImage from  '@salesforce/apex/HF_GalleryProductService.setMainImage';
import MAIN_IMAGE from '@salesforce/schema/Product2.Main_Image__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

const fields = [MAIN_IMAGE];

export default class HfPhotoGalleryProduct extends LightningElement {

    @wire(getRecord, { recordId: '$recordId', fields }) product;

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
                console.log(result);
                this.wiredContentImages = result;
            });
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