import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
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
import { ErrorDialog } from '../searchjson/searchjson.component'

@Component({
    selector: 'json-table',
    templateUrl: './json-table.component.html',
    styleUrls: ['./json-table.component.css'],
    providers: [JsonDataService]
})
export class JsonTable implements OnInit {

    dataSource: JsonDataSource | null;
    exampleDatabase: JsonDatabase;
    @ViewChild('filter') filter: ElementRef;
    displayedColumns = ['id', 'dataKey', 'callID', 'callPhaseID', 'qualifier', 'tableName'];
    jsondata: JsonDataSummary[];
    showSpinner: boolean;
    showTable: boolean;

    constructor(private jsons: JsonDataService, public dialog: MdDialog, public snackBar: MatSnackBar) { }

    ngOnInit() {
        this.jsons.setApiPath();
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

    getAllRecords() {
        this.SetControlState(true);
        this.jsons.getAllJsons()
            .subscribe(jsonResponse => this.initialiseData(jsonResponse));

    }

    getFilteredRecords(criterio: string, searchTerm: string) {
        this.SetControlState(true);
        this.jsons.getSpecificJsons(criterio, searchTerm).subscribe(response => this.initialiseData(response));
    }

    initialiseData(data: JsonDataSummary[]) {
        this.jsondata = data;
        this.exampleDatabase = new JsonDatabase(this.jsondata);
        this.dataSource = new JsonDataSource(this.exampleDatabase);

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
        this.SetControlState(false);
    }

    editJSON(row: any) {
        let datakey = row.dataKey;
        let callphaseid = row.callPhaseID === 'NULL' ? '' : row.callPhaseID;
        let callid = row.callID === 'NULL' ? '' : row.callID;
        let qualifier = row.qualifier === 'NULL' ? '' : row.qualifier;
        let id = row.id;
        let tbName = row.tableName === 'NULL' ? '' : row.tableName;
        this.jsons.getJsonData(datakey).subscribe(data => this.editJsonData(id, datakey, callphaseid, callid, qualifier, data, tbName, row));
    }

    editJsonData(_id: number, dk: string, cpid: string, cid: string, qlf: string, returnedData: string, _tableName: string, originalRow: any) {
        this.dialog.open(JsonEdit, {
            width: '80%',
            height: '95%',
            data: { id: _id, dataKey: dk, callPhaseID: cpid, qualifier: qlf, callID: cid, jsonData: returnedData, tableName: _tableName }
        })
            .afterClosed().subscribe(res => this.saveJSON(res, originalRow));
    }

    saveJSON(js: JsonDataSummary, tableRow: any) {
        try {
            if (js) {
                let checkJSONSyntax = JSON.parse(js.data);
                this.jsons.updateJSONData(js)
                    .subscribe(r => {
                        tableRow.dataKey = js.dataKey === "" ? 'NULL' : js.dataKey; console.log(js.dataKey);
                        tableRow.callPhaseID = js.callPhaseID === "" ? 'NULL' : js.callPhaseID; console.log(js.callPhaseID);
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

    /** Adds a new user to the database. */
    addJson(index: number) {
        const copiedData = this.data.slice();
        let d = this.createNewJson(index);
        copiedData.push(d);
        this.dataChange.next(copiedData);
    }

    createNewJson(index: number): JsonDataSummary {

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


