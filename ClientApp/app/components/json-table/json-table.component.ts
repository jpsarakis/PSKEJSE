import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/catch';
import { JsonDataService, JsonDataSummary } from '../services/json-data.service'
import { JsonEdit } from '../json-edit/json-edit.component';
import { MdDialog, MatSnackBar } from '@angular/material';
import { ErrorDialog } from '../searchjson/searchjson.component';
import { PopupMenu } from '../popup-menu/popup-menu.component';


@Component({
    selector: 'json-table',
    templateUrl: './json-table.component.html',
    styleUrls: ['./json-table.component.css'],
    providers: [JsonDataService]
})
export class JsonTable {

    dataSource: JsonDataSource | null | undefined;
    jsonDatabase: JsonDatabase | undefined;
    @ViewChild('filter') filter: ElementRef;
    displayedColumns = ['id', 'dataKey', 'callID', 'callPhaseID', 'qualifier', 'tableName'];
    jsondata: JsonDataSummary[] | undefined;
    showSpinner: boolean;
    showTable: boolean;
    showLoadingProgreesBar: boolean;
    @ViewChild('popupmenu') popupmenu: PopupMenu = new PopupMenu;
    currentRow: any | undefined;
    currentSearchMethod: number;
    currentSearcCriterio: string;
    currentSearchTerm: string;

    constructor(private jsons: JsonDataService, public dialog: MdDialog, public snackBar: MatSnackBar) {
        this.showSpinner = false;
        this.showTable = false;
        this.showLoadingProgreesBar = false;
        this.currentSearchMethod = 0;
        this.currentSearcCriterio = "";
        this.currentSearchTerm = "";
    }



    SetControlState(loadingData: boolean) {
        if (loadingData) {
            this.showTable = false;
            this.showSpinner = true;
        }
        else {
            this.showTable = true;
            this.showSpinner = false;
        }
    }

    GetAllRecords() {
        this.popupmenu.ResetPopupMenu();
        this.currentSearchMethod = 1;
        this.SetControlState(true);
        this.jsons.getAllJsons()
            .subscribe(jsonResponse => {
                this.InitialiseData(jsonResponse);
                let filter = this.filter.nativeElement as HTMLElement;
                filter.dispatchEvent(new Event('keyup'));
            });
    }

    GetFilteredRecords(criterio: string, searchTerm: string) {
        this.popupmenu.ResetPopupMenu();
        this.currentSearchMethod = 2;
        this.currentSearcCriterio = criterio;
        this.currentSearchTerm = searchTerm;
        this.SetControlState(true);
        this.jsons.getSpecificJsons(criterio, searchTerm).subscribe(response => {
            this.InitialiseData(response);
            let filter = this.filter.nativeElement as HTMLElement;
            filter.dispatchEvent(new Event('keyup'));
        });
       
    }

    InitialiseData(data: JsonDataSummary[]) {
        this.jsondata = data;
        this.jsonDatabase = new JsonDatabase(this.jsondata);
        this.dataSource = new JsonDataSource(this.jsonDatabase);

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });

        this.SetControlState(false);
    }

    DeleteJSON() {
        let row=this.currentRow;
        let deleteRecord = confirm('Are you sure you want to delete this record?');
        if (deleteRecord) {
            this.jsons.deleteJSON(row.id).subscribe(r => {
                if (this.jsonDatabase)
                    this.jsonDatabase.deleteJson(row.id);
                this.snackBar.open('Record was deleted successfully!', '', { duration: 3000 });
                
            });
            
        }
    }

    CopyJSON() {
        let row=this.currentRow;
        let datakey = '';
        let callphaseid = '';
        let callid = '';
        let qualifier = '';
        let id = row.id;
        let tbName = '';
        this.jsons.getJsonData(id).subscribe(data => this.EditJsonData(id, datakey, callphaseid, callid, qualifier, data, tbName, row,true));
    }


    EditJSON() {
        let row=this.currentRow;
        this.showLoadingProgreesBar = true;
        let datakey = row.dataKey === 'NULL' ? "" : row.dataKey;
        let callphaseid = row.callPhaseID === 'NULL' ? '' : row.callPhaseID;
        let callid = row.callID === 'NULL' ? '' : row.callID;
        let qualifier = row.qualifier === 'NULL' ? '' : row.qualifier;
        let id = row.id;
        let tbName = row.tableName === 'NULL' ? '' : row.tableName;
        this.jsons.getJsonData(id).subscribe(data => this.EditJsonData(id, datakey, callphaseid, callid, qualifier, data, tbName, row,false));
    }

    EditJsonData(_id: number, dk: string, cpid: string, cid: string, qlf: string, returnedData: string, _tableName: string, originalRow: any, addNewJson:boolean) {
        this.showLoadingProgreesBar = false;
        let dialog = this.dialog.open(JsonEdit, {
            width: '80%',
            height: '95%',
            data: { id: _id, dataKey: dk, callPhaseID: cpid, qualifier: qlf, callID: cid, jsonData: returnedData, tableName: _tableName, addnewJson: addNewJson }
        });
        if (addNewJson) {
            dialog.afterClosed().subscribe(res => this.SaveNewJSON(res, dialog.componentInstance.uglifyChk.checked));
        } else {
            dialog.afterClosed().subscribe(res => this.SaveJSON(res, originalRow, dialog.componentInstance.uglifyChk.checked));
        }

    }

    ShowPopupMenu(row: any, event: MouseEvent) {
        let x: number = event.clientX;
        let y: number = event.clientY;
        this.currentRow = row;
        this.popupmenu.SetPositionAndShowPopupMenu(x, y);
    }

    PopupMenuAction(action: number) {
        if (action === 1) {
            this.EditJSON();
        } else if (action === 2) {
            this.CopyJSON();
        } else if (action === 3) {
            this.DeleteJSON();
        } else if (action === 0) {
        }   //Do nothing, user choosed to close the menu
        else {
            alert('Unknown Action');
        }
    }

    SaveJSON(js: JsonDataSummary, tableRow: any, uglyfyjson:boolean) {
        try {
            if (js) {
                let data=JSON.parse(js.data);
                if (uglyfyjson) {
                    js.data = JSON.stringify(data, null, 0);
                }
                this.jsons.updateJSONData(js)
                    .subscribe(r => {
                        tableRow.dataKey = js.dataKey === "" ? 'NULL' : js.dataKey;
                        tableRow.callPhaseID = js.callPhaseID === "" ? 'NULL' : js.callPhaseID;
                        tableRow.callID = js.callID === "" ? 'NULL' : js.callID;
                        tableRow.qualifier = js.qualifier === "" ? 'NULL' : js.qualifier;
                        tableRow.tableName = js.tableName === "" ? 'NULL' : js.tableName;
                        this.snackBar.open('Database was updated successfully!', '', { duration: 3000 });
                    });
            }
        } catch (e) {
            this.dialog.open(ErrorDialog, {
                width: '400px',
                data: { errorMessage: e }
            });
        }
    }

    SaveNewJSON(js: JsonDataSummary, uglyfyjson: boolean) {
        try {
            if (js) {
                let data = JSON.parse(js.data);
                if (uglyfyjson) {
                    js.data = JSON.stringify(data, null, 0);
                }
                this.jsons.addJSON(js)
                    .subscribe(r => {
                        this.snackBar.open('New JSON was saved!', '', { duration: 3000 });
                        if (this.currentSearchMethod === 1) {
                            this.GetAllRecords();
                        } else if (this.currentSearchMethod === 2) {
                            this.GetFilteredRecords(this.currentSearcCriterio, this.currentSearchTerm);
                        } else {
                            alert(`Unknown Search Method: ${this.currentSearchMethod}`);
                        }
                    });
            }
        } catch (e) {
            this.dialog.open(ErrorDialog, {
                width: '400px',
                data: { errorMessage: e }
            });
        }
    }

}

export class JsonDatabase {
    /** Stream that emits whenever the data has been modified. */
    dataChange: BehaviorSubject<JsonDataSummary[]> = new BehaviorSubject<JsonDataSummary[]>([]);
    get data(): JsonDataSummary[] { return this.dataChange.value; }

    constructor(private jsondata: JsonDataSummary[]) {
        // Fill up the database with 100 users.

        if (!this.jsondata) {
            alert('Failed to get data from service');
        }
        else {
            for (var i = 0; i < jsondata.length; i++) {
                this.addJson(i);
            }
        }
    }

    /** Adds a new json entry to the database. */
    private addJson(index: number) {
        const copiedData = this.data.slice();
        let d = this.createNewJson(index);
        copiedData.push(d);
        this.dataChange.next(copiedData);
    }

    /**
     * Removes a json entry form the database
     * @param jsonID The id of the entry to be removed
     */
    deleteJson(jsonID: number) {
        const updatedData = this.data.slice();
        let index: number = updatedData.findIndex(j => j.id === jsonID);
        updatedData.splice(index, 1);
        this.dataChange.next(updatedData);
    }

    private createNewJson(index: number): JsonDataSummary {

        return {
            id: this.jsondata[index].id,
            qualifier: this.jsondata[index].qualifier,
            callPhaseID: this.jsondata[index].callPhaseID == "-1" ? "NULL" : this.jsondata[index].callPhaseID,
            dataKey: this.jsondata[index].dataKey,
            callID: this.jsondata[index].callID == "-1" ? "NULL" : this.jsondata[index].callID,
            tableName: this.jsondata[index].tableName,
            data: ""
        }
    }
}

export class JsonDataSource extends DataSource<any> {

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    constructor(private _exampleDatabase: JsonDatabase) {
        super();
    }
    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<JsonDataSummary[]> {
        const displayDataChanges = [
            this._exampleDatabase.dataChange,
            this._filterChange,
        ];

        return Observable.merge(...displayDataChanges).map(() => {
            return this._exampleDatabase.data.slice().filter((item: JsonDataSummary) => {
                let searchstr = (item.dataKey + item.callID + item.callPhaseID + item.qualifier).toLowerCase();
                return searchstr.indexOf(this.filter.toLowerCase()) != -1;
            });
        });
    }

    disconnect() { }
}


