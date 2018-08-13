import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModuleShared } from './app.module.shared';
import { AppComponent } from './components/app/app.component';
import {
    MdToolbarModule, MdSelectModule, MdFormFieldModule, MdInputModule, MdButtonModule, MatProgressSpinnerModule,
    MatGridListModule, MatDialogModule, MatIconModule, MatTableModule, MatSnackBarModule, MdProgressBarModule
    , MdTooltipModule} from '@angular/material';

@NgModule({
    bootstrap: [ AppComponent ],
    imports: [
        ServerModule,
        AppModuleShared,
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
        MatSnackBarModule,
        MdProgressBarModule,
        MdTooltipModule
        
    ]
})
export class AppModule {
}
