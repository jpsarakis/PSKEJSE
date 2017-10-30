import { Component, Input, Output, EventEmitter, OnInit, Inject, ViewChild } from '@angular/core';
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

    showSpinner: boolean;
    searchCriterion: number;
    searchFilter: string;
    @ViewChild('jsontable') jsonTable: JsonTable;

    constructor(public dialog: MdDialog) {
    }

    criteria = [
        { value: '0', description: 'All' },
        { value: '1', description: 'CallID' },
        { value: '2', description: 'CallPhase' },
        { value: '3', description: 'DataKey' },
        { value: '4', description: 'Qualifier' }
    ];

    searchJson() {

        if (!this.searchCriterion || this.searchCriterion==0) {
            this.jsonTable.getAllRecords();
        }
        else {
            if (!this.searchFilter) {
                this.showDialog('Please specify the search filter');
            }
            else {
                this.jsonTable.getFilteredRecords(this.searchCriterion.toString(), this.searchFilter);
            }
        }
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
