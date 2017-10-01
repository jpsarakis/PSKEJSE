import { Component } from '@angular/core';

/**
 * @title Basic select
 */
@Component({
    selector: 'SearchBar',
    templateUrl: 'searchbar.component.html'
})
export class SearchBar {
    criteria = [
        { value: '1', description: 'Call' },
        { value: '2', description: 'Table' },
        { value: '3', description: 'CallPhase' },
        { value: '4', description: 'Table' }
    ];
}