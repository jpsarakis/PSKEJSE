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
import { ErrorDialog } from '../searchjson/searchjson.component'
@Component({
    selector: 'json-table',
    templateUrl: './json-table.component.html',
    styleUrls: ['./json-table.component.css'],
    providers: [JsonDataService]
})
export class JsonTable {

    dataSource: JsonDataSource | null;
    exampleDatabase: JsonDatabase;
    @ViewChild('filter') filter: ElementRef;
    displayedColumns = ['dataKey', 'callID', 'callPhaseID', 'qualifier'];
    jsondata: JsonDataSummary[];
    showSpinner: boolean;
    showTable: boolean;

    constructor(private jsons: JsonDataService, public dialog: MdDialog, public snackBar: MatSnackBar) { }

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
        let callphaseid = row.callPhaseID;
        let callid = row.callID;
        let qualifier = row.qualifier;
        this.jsons.getJsonData(datakey).subscribe(data => this.editJsonData(datakey, callphaseid, callid, qualifier, data));
    }

    editJsonData(dk: string, cpid: string, cid: string, qlf: string, returnedData: string) {
        let obj = JSON.parse(returnedData);
        let pretifyjson = JSON.stringify(obj, null, ' ');
        this.dialog.open(JsonEdit, {
            width: '80%',
            height: '95%',
            data: { dataKey: dk, callPhaseID: cpid, qualifier: qlf, callID: cid, jsonData: pretifyjson }
        })
            .afterClosed().subscribe(res => this.saveJSON(res, dk));
    }

    saveJSON(newJSON: string, datakey: string) {
        try {
            if (newJSON) {
                let checkJSONSyntax = JSON.parse(newJSON);
                this.jsons.updateJSONData(datakey, newJSON)
                    .subscribe(r=>this.snackBar.open('Database was updated successfully!', '', { duration: 3000 }));
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
            console.log('Failed to get data from service');
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
        copiedData.push(this.createNewJson(index));
        this.dataChange.next(copiedData);
    }

    createNewJson(index: number): JsonDataSummary {

        return {
            qualifier: this.jsondata[index].qualifier,
            callPhaseID: this.jsondata[index].callPhaseID == "-1" ? "NULL" : this.jsondata[index].callPhaseID,
            dataKey: this.jsondata[index].dataKey,
            callID: this.jsondata[index].callID == "-1" ? "NULL" : this.jsondata[index].callID,
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


