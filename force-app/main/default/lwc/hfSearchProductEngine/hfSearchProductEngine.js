import { LightningElement,wire,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUsersRoleOptions from '@salesforce/apex/HF_ProductController.getUsersRoleOptions';
import searchForProducts from '@salesforce/apex/HF_ProductController.searchForProducts';

import Loading from '@salesforce/label/c.Loading';
import Add_filters from '@salesforce/label/c.Add_filters';
import Type_in_product_name from '@salesforce/label/c.Type_in_product_name';
import Search_products from '@salesforce/label/c.Search_products';
import Search from '@salesforce/label/c.Search';
import Anti_Theft_Door from '@salesforce/label/c.Anti_Theft_Door';
import Basement from '@salesforce/label/c.Basement';
import Garage from '@salesforce/label/c.Garage';
import Mortgage from '@salesforce/label/c.Loading';
import Swimming_Pool from '@salesforce/label/c.Swimming_Pool';
import Openspace from '@salesforce/label/c.Openspace';
import Own_Bathroom from '@salesforce/label/c.Own_Bathroom';
import Parking_Lots from '@salesforce/label/c.Parking_Lots';
import Shop_Window from '@salesforce/label/c.Shop_Window';
import Storage_Room from '@salesforce/label/c.Storage_Room';
import No_results_found from '@salesforce/label/c.No_results_found';
import Change_criteria_info from '@salesforce/label/c.Change_criteria_info';

export default class HfSearchProductEngine extends LightningElement {

    label = {
        Loading,
        Add_filters,
        Type_in_product_name,
        Search_products,
        Search,
        Anti_Theft_Door,
        Basement,
        Garage,
        Mortgage,
        Swimming_Pool,
        Openspace,
        Own_Bathroom,
        Parking_Lots,
        Shop_Window,
        Storage_Room,
        No_results_found,
        Change_criteria_info
    }
    queryTerm='';
    @track searchValue;
    value=[];

    handleChange(e) {
        this.value = e.detail.value;
    }

    @track options=[];
    @track mapData =[];
    @track searchResults=[];
    @track isLoading=true;
    @wire
    (getUsersRoleOptions) roleOptions({data,error}) {
        if(data){
        for(let key in data){
            this.mapData.push({value:data[key], key:key});
        }

        this.setOptions(this.mapData);
        this.isLoading=false;
        }
        else if(error){
            const evt = new ShowToastEvent({
                title: this.label.Error,
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(evt);
        }
    }

    handleInputChange(event){
        this.searchValue = event.detail.value;
    }

    setOptions(stringMap){
        for(let key in stringMap){
            this.options.push({label: stringMap[key].key, value: stringMap[key].value});
        }
    }

    connectedCallback(){
        this.isLoading=false;
    }


   handleKeyUp(evt) {
       const isEnterKey = evt.keyCode;

       if (isEnterKey == 13) {
           this.queryTerm = evt.target.value;
           this.showSearchResults(this.queryTerm, this.value);
           this.isLoading=true;
       }

   }

   handleSearch(){
        this.showSearchResults(this.searchValue, this.value);
        this.isLoading=true;
   }

   showSearchResults(queryTerm, pickedValues){
        searchForProducts({inputName : queryTerm, pickedOptionsValuesList : pickedValues})
            .then(result => {
                this.searchResults=result;
                this.isLoading=false;
                if(this.searchResults.length==0){
                    this.dispatchEvent(new ShowToastEvent({
                        title: this.label.No_results_found,
                        message: this.label.Change_criteria_info,
                        variant: 'warning',
                        mode: 'pester'
                    }))
                }
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
}
