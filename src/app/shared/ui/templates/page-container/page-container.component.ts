import { Component } from '@angular/core';

@Component({
  selector: 'kq-page-container',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
    :host {
      display: block;
      width: 100%;
      max-width: 52rem;
      margin-left: auto;
      margin-right: auto;
      padding-top: 1rem;
    }
    `,
  ],
})
export class PageContainerComponent {}
