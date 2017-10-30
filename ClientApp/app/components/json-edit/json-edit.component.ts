import { Component, Inject} from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'json-edit',
    templateUrl: 'json-edit.component.html',
    styleUrls: ['json-edit.component.css']
})
export class JsonEdit {

    constructor(
        public dialogRef: MdDialogRef<JsonEdit>,
        @Inject(MD_DIALOG_DATA) public data: any) { }

    onCloseClick(): void {
        this.dialogRef.close();
    }

}
