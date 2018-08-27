import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'popup-menu',
    templateUrl: './popup-menu.component.html',
    styleUrls: ['./popup-menu.component.css'],
    animations: [
        trigger('isPopupMenuVisible', [
            state('yes', style({
                opacity: 1,
                transform: 'scale(1)'
            })),
            state('no', style({
                transform: 'scale(0)',
                opacity: 0
            })),
            transition('no <=> yes', animate('200ms ease-in')),
        ]),
    ],
})
export class PopupMenu {

    Xposition: number;
    YPosition: number;
    isPopupMenuVisible: string = "no";
    showPopupMenu: boolean;
    @ViewChild('menudiv') maindiv: ElementRef | undefined;
    @Output() buttonClicked: EventEmitter<number> = new EventEmitter();
    idleTimer:number;


    constructor() {
        this.Xposition = 0;
        this.YPosition = 0;
        this.idleTimer=0;
        this.showPopupMenu = false;
    }


    private ShowPopupMenu() {
        this.showPopupMenu = true;
        this.isPopupMenuVisible = 'yes';
    }


    public HidePopupMenu() {
        this.isPopupMenuVisible = 'no';
    }

    public ResetPopupMenu() {
        this.showPopupMenu = false;
        this.isPopupMenuVisible = 'no';
    }

    SetPositionAndShowPopupMenu(x: number, y: number) {
        if (this.showPopupMenu){
            this.HidePopupMenu();
            setTimeout(() => {
                this.Xposition = x - 60;
                this.YPosition = y - 105;
                this.ShowPopupMenu();
            }, 650);
        }
        else{
            this.Xposition = x - 60;
            this.YPosition = y - 105;
            this.ShowPopupMenu();
        }
    }



    ActionButtonClicked(action: number) {
        this.isPopupMenuVisible = "no";
        setTimeout(() => {
            this.showPopupMenu = false;
        }, 300);
        this.buttonClicked.emit(action);
    }

}