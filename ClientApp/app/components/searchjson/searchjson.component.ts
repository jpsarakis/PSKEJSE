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


    criteria = [
        { value: 0, description: 'All' },
        { value: 1, description: 'CallID' },
        { value: 2, description: 'CallPhase' },
        { value: 3, description: 'DataKey' },
        { value: 4, description: 'Qualifier' }
    ];



    constructor(public dialog: MdDialog) {
        this.showSpinner = false;
        this.searchCriterion = 0;
        this.searchFilter = "";
    }

   

    searchJson() {

        if (this.searchCriterion==0) {
            this.jsonTable.GetAllRecords();
        }
        else {
            if (!this.searchFilter) {
                this.showError('Please specify the search filter');
            }
            else {
                this.jsonTable.GetFilteredRecords(this.searchCriterion.toString(), this.searchFilter);
            }
        }
    }

    showError(message: string) {
        this.dialog.open(ErrorDialog, {
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
