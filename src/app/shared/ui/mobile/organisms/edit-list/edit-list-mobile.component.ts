import { Component } from '@angular/core';

@Component({
  selector: 'kq-edit-list-mobile',
  standalone: true,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
  `],
})
export class EditListMobileComponent {}
