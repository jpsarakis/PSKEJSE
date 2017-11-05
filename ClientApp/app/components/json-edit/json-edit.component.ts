import { Component, Inject, ElementRef, ViewChild, OnInit } from '@angular/core';
import { JsonDataSummary } from '../services/json-data.service'
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Observable } from "rxjs/Observable";

@Component({
    selector: 'json-edit',
    templateUrl: 'json-edit.component.html',
    styleUrls: ['json-edit.component.css']
})
export class JsonEdit implements OnInit {
    public isJSONInvalid: boolean;
    public jsonSyntaxError: string;
    public carretPos: number;
    public jsonItem: JsonDataSummary;
    @ViewChild('userJSONData') userJSONData: ElementRef;

    constructor(
        public dialogRef: MdDialogRef<JsonEdit>,
        @Inject(MD_DIALOG_DATA) public data: any) {
        this.jsonItem = { id: this.data.id, callID: this.data.callID, callPhaseID: this.data.callPhaseID, qualifier: this.data.qualifier, dataKey: this.data.dataKey, tableName: this.data.tableName, data:this.data.jsonData };
        this.validateJSON();
    }

    ngOnInit() {
        Observable.fromEvent(this.userJSONData.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                this.carretPos=this.userJSONData.nativeElement.selectionStart;
                this.validateJSON()
            });
        Observable.fromEvent(this.userJSONData.nativeElement, 'click')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                this.carretPos = this.userJSONData.nativeElement.selectionStart;
            });

    }

    pretifyJSON() {
        let obj = JSON.parse(this.jsonItem.data);
        let pretifyjson = JSON.stringify(obj, null, ' ');
        this.jsonItem.data = pretifyjson;
    }

    validateJSON() {
        try {
            let obj = JSON.parse(this.jsonItem.data);
            let pretifyjson = JSON.stringify(obj, null, ' ');
            this.jsonSyntaxError = "";
            this.isJSONInvalid = false;
        } catch (e) {
            this.isJSONInvalid = true;
            this.jsonSyntaxError = e;
        }
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

}
