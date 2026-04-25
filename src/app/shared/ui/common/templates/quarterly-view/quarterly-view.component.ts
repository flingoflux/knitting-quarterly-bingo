import { Component } from '@angular/core';

@Component({
  selector: 'kq-quarterly-view-template',
  standalone: true,
  template: `
    <section class="quarterly-view-shell">
      <ng-content></ng-content>
    </section>
  `,
  styles: [
    `.quarterly-view-shell {
      min-height: 100%;
    }`,
  ],
})
export class QuarterlyViewTemplateComponent {}
