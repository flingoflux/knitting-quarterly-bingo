import { Component } from '@angular/core';

@Component({
  selector: 'kq-board-grid-mobile',
  standalone: true,
  imports: [],
  template: `<ng-content />`,
  styles: [`
    :host {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.4rem;
      margin: 0 auto;
    }
  `],
})
export class BoardGridMobileComponent {}
