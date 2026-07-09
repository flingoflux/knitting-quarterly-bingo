import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'kq-board-grid-desktop',
  standalone: true,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: grid;
      gap: 0.6rem;
      margin: 0.5rem auto 0;
      align-items: stretch;
    }
    :host(.mode-polaroid) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: var(--kq-shell-max-width);
    }

  `]
})
export class BoardGridDesktopComponent {
  @HostBinding('class.mode-polaroid') readonly isPolaroid = true;
}
