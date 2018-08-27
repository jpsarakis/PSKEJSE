import { Injectable, Inject, Component } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';



@Injectable()
export class JsonDataService {
    apiURL: string;

    constructor(private http: Http, private dialog: MdDialog) {
        this.apiURL = "api/json/";
    }


    getAllJsons(): Observable<JsonDataSummary[]> {
        return this.http.get(this.apiURL + 'GetAllJsons')
            .map(res => res.json() as JsonDataSummary[])
            .catch(err => {
                this.showException(err);
                return Observable.of<JsonDataSummary[]>([]);
            });
    }

    getSpecificJsons(criterion: string, filter: string) {
        return this.http.get(this.apiURL + 'GetJsons?criterion=' + criterion + '&filter=' + filter)
            .map(res => res.json() as JsonDataSummary[])
            .catch(err => {
                this.showException(err);
                return Observable.of<JsonDataSummary[]>([]);
            });
    }

    getJsonData(id: number) {
        return this.http.get(this.apiURL + 'GetJsonData?id=' + id)
            .map(res => res.json() as string)
            .catch(err => {
                this.showException(err);
                return Observable.of<string>();
            });
    }

    updateJSONData(jsonItem: JsonDataSummary): Observable<string> {
        let _headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http
            .put(this.apiURL + `${jsonItem.id}`,
            jsonItem,
            { headers: _headers })
            .map(t => t.json())
            .catch(err => {
                this.showException(err);
                return Observable.of<string>();
            });
    }

    addJSON(jsonItem: JsonDataSummary): Observable<string> {
        let _headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http
            .post(this.apiURL,
            jsonItem,
            { headers: _headers })
            .map(t => t.json())
            .catch(err => {
                this.showException(err);
                return Observable.of<string>();
            });
    }

    deleteJSON(id: number) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        let url: string = this.apiURL + `${id}`;
        return this.http.delete(url,options)
            .catch(e => {
                this.showException(e);
                return Observable.of<JsonDataSummary>();
            });

    }


    showException(err: Response) {
        let dialogRef = this.dialog.open(ExceptionDialog, {
            width: '50%',
            height: '50%',
            data: { status: err.status, statusText: err.statusText, url: err.url, body: err.text() }
        });
    }

}

export interface JsonDataSummary {
    id: number;
    callID: string;
    callPhaseID: string;
    dataKey: string;
    qualifier: string;
    tableName: string;
    data: any;
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