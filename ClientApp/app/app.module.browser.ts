import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppModuleShared } from './app.module.shared';
import { AppComponent } from './components/app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MdToolbarModule, MdSelectModule, MdFormFieldModule, MdInputModule, MdButtonModule, MatProgressSpinnerModule,
    MatGridListModule, MatDialogModule, MatIconModule, MatTableModule, MatSnackBarModule
} from '@angular/material';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MdSelectModule,
        MdToolbarModule,
        MdFormFieldModule,
        MdInputModule,
        MdButtonModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        AppModuleShared,
        MatSnackBarModule
    ],
    providers: [
        { provide: 'BASE_URL', useFactory: getBaseUrl }
    ]
})
export class AppModule {
}

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}
