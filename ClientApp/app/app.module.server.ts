import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModuleShared } from './app.module.shared';
import { AppComponent } from './components/app/app.component';
import { MdToolbarModule, MdSelectModule, MdFormFieldModule, MdInputModule, MdButtonModule } from '@angular/material';

@NgModule({
    bootstrap: [ AppComponent ],
    imports: [
        ServerModule,
        AppModuleShared,
        MdToolbarModule,
        MdFormFieldModule,
        MdInputModule,
        MdButtonModule,
        AppModuleShared
    ]
})
export class AppModule {
}
