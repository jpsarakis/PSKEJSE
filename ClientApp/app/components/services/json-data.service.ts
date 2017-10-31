import { Injectable, Inject, Component } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

@Injectable()
export class JsonDataService {

    constructor(private http: Http, private dialog: MdDialog) { }


    getAllJsons(): Observable<JsonDataSummary[]> {
        return this.http.get('/api/Json/GetAllJsons')
            .map(res => res.json() as JsonDataSummary[])
            .catch(err => {
                this.showException(err);
                return Observable.of<JsonDataSummary[]>([]);
            });
    }

    getSpecificJsons(criterion: string, filter: string) {
        return this.http.get('/api/Json/GetJsons?criterion=' + criterion + '&filter=' + filter)
            .map(res => res.json() as JsonDataSummary[])
            .catch(err => {
                this.showException(err);
                return Observable.of<JsonDataSummary[]>([]);
            });
    }

    getJsonData(datakey: string) {
        return this.http.get('/api/Json/GetJsonData?dataKey=' + datakey)
            .map(res => res.json() as string)
            .catch(err => {
                this.showException(err);
                return Observable.of<string>();
            });
    }

    updateJSONData(dataKey:string, newdata: string):Observable<string> {
        let _headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http
            .put(`/api/Json/${dataKey}`,
            newdata,
            { headers: _headers })
            .map(t=>t.json())
            .catch(err => {
                this.showException2(err);
                return Observable.of<string>();
            });
    }

    showException(err: Response) {
        let dialogRef = this.dialog.open(ExceptionDialog, {
            width: '50%',
            height: '90%',
            data: { status: err.status, statusText: err.statusText, url: err.url, body: err.text() }
        });
    }
    showException2(err: Response) {
        let dialogRef = this.dialog.open(ExceptionDialog, {
            width: '50%',
            height: '90%',
            data: { status: err.status, statusText: err.statusText, url: err.url, body: '' }
        });
    }

}

export interface JsonDataSummary {
    callID: string;
    callPhaseID: string;
    dataKey: string;
    qualifier: string;
}

@Component({
    selector: 'exception-dialog',
    templateUrl: 'exception-dialog.html',
    styleUrls: ['exception-dialog.css']
})
export class ExceptionDialog {

    constructor(
        public dialogRef: MdDialogRef<ExceptionDialog>,
        @Inject(MD_DIALOG_DATA) public data: any) { }

    onOKClick(): void {
        this.dialogRef.close();
    }
}