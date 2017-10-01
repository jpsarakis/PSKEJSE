import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { MdToolbarModule, MdSelectModule, MdFormFieldModule, MD_PLACEHOLDER_GLOBAL_OPTIONS, MdInputModule, MdButtonModule } from '@angular/material';
import { SearchBar } from './components/searchbar/searchbar.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SearchBar
    ],
    providers: [
        { provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'auto' } }
        ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        MdToolbarModule,
        MdSelectModule,
        MdFormFieldModule,
        MdInputModule,
        MdButtonModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: '**', redirectTo: 'home' }
        ])
    ]
})
export class AppModuleShared {
}
