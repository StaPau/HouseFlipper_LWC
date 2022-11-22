import { LightningElement,api,track,wire} from 'lwc';
import getPricebooks from '@salesforce/apex/HF_GetPricebooks.getPricebooks';

const pricebooks = [];
const actions = [
    { label: 'Add products', name: 'add' },
    { label: 'Edit pricebook', name: 'edit' },
    { label: 'Delete pricebook', name: 'delete' },
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
         {
             type: 'action',
             typeAttributes: { rowActions: actions },
         }
//      { type: 'button-icon', initialWidth: 75,
//            typeAttributes: {
//                iconName: 'utility:add',
//                title: 'Add products to pricebook',
//                variant: 'border-filled',
//                alternativeText: 'Add products',
//
//            }},
//     { type: 'button-icon', initialWidth: 75,
//           typeAttributes: {
//               iconName: 'action:edit',
//               title: 'Edit pricebook',
//               variant: 'border-filled',
//               alternativeText: 'Edit pricebook'
//           }},
//       { type: 'button-icon', initialWidth: 75,
//             typeAttributes: {
//                 iconName: 'utility:delete',
//                 title: 'Delete pricebook',
//                 variant: 'border-filled',
//                 alternativeText: 'Delete pricebook'
//             }}
];
const value='';

export default class HfShowPricebookTable extends LightningElement {
    @track data;
    @api value;
    @api isLoaded=false;
    columns=columns;
    record = {};

    connectedCallback(){
        this.isLoaded=true;
    }
    @wire (getPricebooks, {recordTypeId : '$value'}) pricebooks (results){
        if(results.data){
            this.data = results.data.map(row => {
                return {...row,EntryType : row.RecordType.Name}
            });
            this.data.sort((a,b)=> (a.Name > b.Name ? 1 : -1)) //For Ascending
            this.error=undefined;
        }
        else if (results.error) {
             this.error = results.error;
             this.data = undefined;
         }
    }

    handleRowAction(event) {
            const actionName = event.detail.action.name;
            const row = event.detail.row;
            switch (actionName) {
                case 'delete':
                    this.deleteRow(row);
                    break;
                case 'edit':
                    this.showRowDetails(row);
                    break;
                case 'add':
                    this.addProducts(row);
                    break;
                default:
            }
        }

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
        console.log(JSON.stringify(this.record));
    }


}