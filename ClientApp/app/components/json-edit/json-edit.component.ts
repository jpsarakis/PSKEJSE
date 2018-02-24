import { Component, Inject, ElementRef, ViewChild, OnInit } from '@angular/core';
import { JsonDataSummary } from '../services/json-data.service'
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Observable } from "rxjs/Observable";
import 'brace';
import "brace/mode/json";

@Component({
    selector: 'json-edit',
    templateUrl: 'json-edit.component.html',
    styleUrls: ['json-edit.component.css']
})
export class JsonEdit implements OnInit {
    private isJSONInvalid: boolean;
    public jsonItem: JsonDataSummary;
    @ViewChild('aceeditor') aceEditor: any;
    private aceTheme: string="textmate";


    constructor(
        public dialogRef: MdDialogRef<JsonEdit>,
        @Inject(MD_DIALOG_DATA) public data: any) {
        this.jsonItem = { id: this.data.id, callID: this.data.callID, callPhaseID: this.data.callPhaseID, qualifier: this.data.qualifier, dataKey: this.data.dataKey, tableName: this.data.tableName, data: this.data.jsonData };
        this.validateJSON();
    }

    aceThemes = [
        { value: 'textmate', description: 'Light' },
        { value: 'monokai', description: 'Dark' },

    ];

    ngOnInit() {
        this.aceEditor.getEditor().session.setOption("useWorker", true);
        let savedTheme = localStorage.getItem("pskejse_aceTheme");
        if (savedTheme){
            this.aceTheme = savedTheme;
        }
        this.aceEditor.setTheme(this.aceTheme);
    }

    changeTheme() {
        this.aceEditor.setTheme(this.aceTheme);
        localStorage.setItem("pskejse_aceTheme", this.aceTheme);
    }

    pretifyJSON() {
        let obj = JSON.parse(this.jsonItem.data);
        let pretifyjson = JSON.stringify(obj, null, ' ');
        this.jsonItem.data = pretifyjson;
    }

    onAceEditorTextChanged(code:string) {
        this.validateJSON();
    }

    validateJSON() {
        try {
            let obj = JSON.parse(this.jsonItem.data);
            let pretifyjson = JSON.stringify(obj, null, ' ');
            this.isJSONInvalid = false;
        } catch (e) {
            this.isJSONInvalid = true;
        }
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

}
