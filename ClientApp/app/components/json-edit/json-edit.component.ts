import { Component, Inject, ElementRef, ViewChild, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { JsonDataSummary, JsonDataService } from '../services/json-data.service'
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import 'brace';
import "brace/mode/json";


@Component({
    selector: 'json-edit',
    templateUrl: 'json-edit.component.html',
    animations: [
        trigger('jsonSaveNotificationState', [
            state('inactive', style({
                opacity: 0
            })),
            state('active', style({
                opacity: 1
            })),
            transition('active <=> inactive', animate('600ms ease-in')),
        ]),
    ],
    providers: [JsonDataService]
})
export class JsonEdit implements OnInit {

    public aceTheme: string; // Must be public otherwise it causes issues during publish
    public isJSONInvalid: boolean; // Must be public otherwise it causes issues during publish
    public jsonItem: JsonDataSummary;
    @ViewChild('aceeditor') aceEditor: any;
    @ViewChild('dataKey') dataKey: ElementRef;
    @ViewChild('tableName') tableName: ElementRef;
    public saveNotificationState: string = "inactive";
    public ShowSaveButton: boolean = true;

    aceThemes = [
        { value: 'textmate', description: 'Light' },
        { value: 'monokai', description: 'Dark' },
    ];

    constructor(
        private dataSource: JsonDataService,
        public dialogRef: MdDialogRef<JsonEdit>,
        @Inject(MD_DIALOG_DATA) public data: any) {
        this.jsonItem = { id: this.data.id, callID: this.data.callID, callPhaseID: this.data.callPhaseID, qualifier: this.data.qualifier, dataKey: this.data.dataKey, tableName: this.data.tableName, data: this.data.jsonData };
        this.isJSONInvalid = false;
        this.aceTheme = this.aceThemes[0].value;
        this.validateJSON();
    }


    ngOnInit() {
        this.aceEditor.getEditor().session.setOption("useWorker", true);
        let savedTheme = localStorage.getItem("pskejse_aceTheme");
        if (savedTheme) {
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

    onAceEditorTextChanged(code: string) {
        this.validateJSON();
    }

    validateJSON() {
        try {
            let obj = JSON.parse(this.jsonItem.data);
            JSON.stringify(obj, null, ' ');
            this.isJSONInvalid = false;
        } catch (e) {
            this.isJSONInvalid = true;
        }
    }

    validateForm(): boolean {
        console.log(this.dataKey.nativeElement.value.length);

        if (this.dataKey.nativeElement.value.length <= 0
            || this.tableName.nativeElement.value.length <= 0)
            return false;
        else
            return true;
    }

    hideSaveButton() {
        this.ShowSaveButton = false;
        console.log(this.ShowSaveButton);
    }

    saveJSON() {
        if (!this.isJSONInvalid && this.validateForm()) {
            try {
                this.dataSource.updateJSONData(this.jsonItem).subscribe(() => {
                    this.saveNotificationState = 'active';
                    this.hideSaveJSONNotification();
                });

            } catch (e) {
                alert(e);
            }
        }
    }

    hideSaveJSONNotification() {
        setTimeout(() => { this.saveNotificationState = 'inactive' }, 1000);
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

}
