import { LightningElement,api,track,wire} from 'lwc';
import getPricebooks from '@salesforce/apex/HF_GetPricebooks.getPricebooks';
import { refreshApex } from '@salesforce/apex';
import Add_Products from '@salesforce/label/c.Add_Products';
import View_pricebook_entries from '@salesforce/label/c.View_pricebook_entries';
import Edit_pricebook from '@salesforce/label/c.Edit_pricebook';
import Pricebook_Name from '@salesforce/label/c.Pricebook_Name';
import Description from '@salesforce/label/c.Description';
import Start_Date from '@salesforce/label/c.Start_Date';
import End_Date from '@salesforce/label/c.End_Date';
import Entries_Type from '@salesforce/label/c.Entries_Type';
import Active from '@salesforce/label/c.Active';
import Loading from '@salesforce/label/c.Loading';

const label2 = {
    Add_Products,
    View_pricebook_entries,
    Edit_pricebook,
    Pricebook_Name,
    Description,
    Start_Date,
    End_Date,
    Entries_Type,
    Active
}

const actions = [
    { label: label2.Add_Products, name: 'add' },
    { label: label2.View_pricebook_entries, name: 'view' },
    { label: label2.Edit_pricebook, name: 'edit' },
];
const columns = [
     { label: label2.Pricebook_Name, fieldName: 'Name' },
     { label: label2.Description, fieldName: 'Description'},
     { label: label2.Start_Date, fieldName: 'Start_Date__c',   type: 'date',
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
     { label: label2.End_Date, fieldName: 'End_Date__c',
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
     { label: label2.Entries_Type, fieldName: 'EntryType' },
     { label: label2.Active, fieldName: 'IsActive' ,editable: true, type : 'boolean' },
     { type: 'action', typeAttributes: { rowActions: actions } }
];


export default class HfShowPricebookTable extends LightningElement {
    @track data;
    @api value;
    @api row;
    @api isModalOpen;
    @track isLoaded=false;
    @track addProductClicked=false;
    @track editPricebookClicked=false;
    @track viewProductsClicked=false;
    areProductsAdded;
    columns=columns;
    record = {};
    @track refreshedPricebooks;
    @track refreshedPricebookEntries;

    label = {
        Loading  
    }
    

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

            const evt = new ShowToastEvent({
                title: this.label.Error,
                message: results.error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(evt);

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
            case 'view':
                this.viewProducts(this.row);
                break;
            default:
        }

    }


    getAddPricebookModalFlag(event){
        this.isModalOpen=false;
        const sendClosedModalFlag = new CustomEvent("modalclosed",{
            detail: this.refreshedPricebooks
        });
        this.dispatchEvent(sendClosedModalFlag);
    }

    getAddProductModalFlag(event){
       this.addProductClicked=false;
       refreshApex(this.refreshedPricebooks);
       refreshApex(this.refreshedPricebookEntries);
    }

    getProductsAddedFlag(event){
        this.areProductsAdded=event.detail;
    }
    getEditModalFlag(event){
       this.editPricebookClicked=false;
       refreshApex(this.refreshedPricebooks);
    }

    getViewModalFlag(event){
        this.viewProductsClicked=false;
    }

    getRefreshedPricebookEntries(event){
        this.refreshedPricebookEntries = event.detail;
    }

    showRowDetails(row) {
        this.record = row;
        this.editPricebookClicked=true;
    }

    addProducts(row){
        this.addProductClicked=true;
    }

    viewProducts(row) {
        this.record = row;
        this.viewProductsClicked=true;
    }
}