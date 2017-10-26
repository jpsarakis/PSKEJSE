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
import { JsonDataService, JsonDataSummary } from '../services/json-data.service'

@Component({
    selector: 'json-table',
    templateUrl: './json-table.component.html',
    providers: [JsonDataService]
})
export class JsonTable {

    dataSource: ExampleDataSource | null;
    exampleDatabase: ExampleDatabase;
    @ViewChild('filter') filter: ElementRef;
    displayedColumns = ['dataKey', 'callID','callPhaseID', 'qualifier'];
    jsondata: JsonDataSummary[];

    constructor(private jsons: JsonDataService) { }

    ngOnInit() {
        this.jsons.getAllJsons().subscribe(jsonResponse => this.initialiseData(jsonResponse));
    }

    initialiseData(data: JsonDataSummary[]) {
        this.jsondata = data;
        this.exampleDatabase = new ExampleDatabase(this.jsondata);
        this.dataSource = new ExampleDataSource(this.exampleDatabase);

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });

    }
}

export class ExampleDatabase {
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
            console.log(this.data);
        }
    }

    /** Adds a new user to the database. */
    addJson(index: number) {
        const copiedData = this.data.slice();
        copiedData.push(this.createNewJson(index));
        this.dataChange.next(copiedData);
    }

    createNewJson(index: number):JsonDataSummary {

        return {

            qualifier: this.jsondata[index].qualifier,
            callPhaseID: this.jsondata[index].callPhaseID,
            dataKey: this.jsondata[index].dataKey,
            callID: this.jsondata[index].callID,
            tableName: this.jsondata[index].tableName,
            id: this.jsondata[index].id
        }
    }
}

export class ExampleDataSource extends DataSource<any> {

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

   
    constructor(private _exampleDatabase: ExampleDatabase) {
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
                let searchstr = (item.dataKey).toLowerCase();
                return searchstr.indexOf(this.filter.toLowerCase()) != -1;
            });
        });
    }

    disconnect() { }
}


