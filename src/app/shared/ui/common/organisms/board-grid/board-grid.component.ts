import { Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'kq-board-grid',
  standalone: true,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: grid;
      gap: var(--kq-board-grid-gap, 0.6rem);
      margin: var(--kq-board-grid-margin, 0.5rem auto 0);
      align-items: stretch;
    }
    :host(.mode-polaroid) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: var(--kq-shell-max-width);
    }
    :host(.mode-mobile) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      --kq-board-grid-gap: 0.4rem;
      --kq-board-grid-margin: 0 auto;
    }
  `]
})
export class BoardGridComponent {
  mode = input<'polaroid' | 'mobile'>('polaroid');

  @HostBinding('class.mode-polaroid')
  get isPolaroid(): boolean {
    return this.mode() === 'polaroid';
  }

  @HostBinding('class.mode-mobile')
  get isMobile(): boolean {
    return this.mode() === 'mobile';
  }
}
