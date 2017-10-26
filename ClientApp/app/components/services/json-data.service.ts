import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
@Injectable()
export class JsonDataService {

    allJsons: any;

    constructor(private http: Http) { }


    getAllJsons(): Observable<JsonDataSummary[]> {
        return this.http.get('/api/GetAllJsons')
            .map(res => res.json() as JsonDataSummary[] );
    }

 

}

export interface JsonDataSummary {
    callID: number;
    callPhaseID: number;
    dataKey: string;
    id: number;
    qualifier: string;
    tableName: string;
}