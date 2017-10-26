import { Component, Input, Output, EventEmitter, OnInit, Inject } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { JsonTable } from '../json-table/json-table.component';

/**
 * @title Basic select
 */
@Component({
    selector: 'search-json',
    templateUrl: 'searchjson.component.html'
})
export class SearchJson {

    showJsonTable: boolean;
    showSpinner: boolean;
    searchCriterion: number;
    searchFilter: string;

    constructor(public dialog: MdDialog) { }

    ngOnInit() {
        this.showJsonTable = true;
        this.showSpinner = false;
    }

    criteria = [
        { value: '1', description: 'Call' },
        { value: '2', description: 'Callphase' },
        { value: '3', description: 'DataKey' },
        { value: '4', description: 'Table' }
    ];

    searchJson() {
        if (!this.searchCriterion) {
           this.showDialog('Please specify what to search');
            return;
        }
        if (!this.searchFilter) {
            this.showDialog('Please specify the search filter');
            return;
        }
        this.showSpinner = true;

    }

    showDialog(message: string) {
        let dialogRef = this.dialog.open(ErrorDialog, {
            width: '350px',
            data: { errorMessage: message }
        });
    }
}

@Component({
    selector: 'error-dialog',
    templateUrl: 'error-dialog.html',
})
export class ErrorDialog {

    constructor(
        public dialogRef: MdDialogRef<ErrorDialog>,
        @Inject(MD_DIALOG_DATA) public data: any) { }

    onOKClick(): void {
        this.dialogRef.close();
    }

}
