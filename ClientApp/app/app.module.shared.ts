import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { JsonTable } from './components/json-table/json-table.component';
import { HttpClientModule } from '@angular/common/http';
import {
    MdToolbarModule, MdSelectModule, MdFormFieldModule, MD_PLACEHOLDER_GLOBAL_OPTIONS, MdInputModule, MdButtonModule,
    MatProgressSpinnerModule, MatGridListModule, MatDialogModule, MatIconModule, MatTableModule
} from '@angular/material';
import { SearchJson,ErrorDialog } from './components/searchjson/searchjson.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SearchJson,
        ErrorDialog,
        JsonTable
    ],
    providers: [
        { provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'auto' } }
    ],
    entryComponents: [
        ErrorDialog
    ],
    imports: [
        CommonModule,
        HttpModule,
        HttpClientModule,
        FormsModule,
        MdToolbarModule,
        MdSelectModule,
        MdFormFieldModule,
        MdInputModule,
        MdButtonModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatGridListModule,
        MatTableModule,
        MatIconModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: '**', redirectTo: 'home' }
        ])
    ]
})
export class AppModuleShared {
}
