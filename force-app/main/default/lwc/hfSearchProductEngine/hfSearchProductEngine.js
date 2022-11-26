import { LightningElement,wire,api,track } from 'lwc';

export default class HfSearchProductEngine extends LightningElement {
    queryTerm;
    @track searchValue;
    //temp:
    isUserB2B = true;


//    get options(){
//        return[
//            {label: 'Yes', value='true'},
//            {label: 'No', value='false'},
//            ];
//    }
//    handleKeyUp(evt) {
//        const isEnterKey = evt.keyCode;
//
//        if (isEnterKey == 13) {
//            this.queryTerm = evt.target.value;
//        }
//    }
}
