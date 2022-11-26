import { LightningElement,api,track,wire} from 'lwc';
import getPricebooks from '@salesforce/apex/HF_GetPricebooks.getPricebooks';

const pricebooks = [];
const actions = [
    { label: 'Add products', name: 'add' },
    { label: 'Edit pricebook', name: 'edit' },
];
const columns = [
     { label: 'Pricebook Name', fieldName: 'Name' },
     { label: 'Description', fieldName: 'Description'},
     { label: 'Start Date', fieldName: 'Start_Date__c',   type: 'date',
          typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }
      },
     { label: 'End Date', fieldName: 'End_Date__c',
        type: 'date',
        typeAttributes: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }},
     { label: 'Entries Type', fieldName: 'EntryType' },
     { label: 'Active', fieldName: 'IsActive' ,editable: true, type : 'boolean' },
     { type: 'action', typeAttributes: { rowActions: actions } }
];

const value='';

export default class HfShowPricebookTable extends LightningElement {
    @track data;
    @api value;
    @api row;
    @api isModalOpen = false;
    @track isLoaded=false;
    @track addProductClicked=false;
    @track editPricebookClicked=false;

    columns=columns;
    record = {};
    @track editPricebookClickedTracked;
    @api refreshedPricebooks;

    connectedCallback(){
        this.isLoaded=true;
    }

    @wire (getPricebooks, {recordTypeId : '$value'}) pricebooks (results){
        this.refreshedPricebooks = results;
        if(results.data){
            this.data = results.data.map(row => {
                return {...row,EntryType : row.RecordType.Name}
            });
            this.data.sort((a,b)=> (a.Name > b.Name ? 1 : -1))
            this.error=undefined;
        }
        else if (results.error) {
             this.error = results.error;
             this.data = undefined;
         }

    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        this.row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.showRowDetails(this.row);
                break;
            case 'add':
                this.addProducts(this.row);
                break;
            default:
        }

        }

    sendRefreshedTable(event){
        this.isModalOpen=false;
        const sendCloseInfoEvent = new CustomEvent ( "modalclosed",{
                     detail : this.refreshedPricebooks
                 });
         this.dispatchEvent(sendCloseInfoEvent);
    }

    getAddProductModalFlag(event){
       this.addProductClicked=false;
    }

    getEditModalFlag(event){
       this.editPricebookClicked=false;
    }

    getOpenAddProductModalFlag(event){
       this.addProductClicked = event.detail;
    }

    showRowDetails(row) {
        this.record = row;
        this.editPricebookClicked=true;
    }

    addProducts(row){
        this.addProductClicked=true;
    }




}