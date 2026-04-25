import { Component, HostBinding, Input } from '@angular/core';

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
    :host(.mode-kompakt) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: var(--kq-toolbar-max-width-horizontal);
      gap: 0.4rem;
    }

  `]
})
export class BoardGridDesktopComponent {
  @Input() set mode(value: 'polaroid' | 'kompakt') {
    this._mode = value;
  }
  get mode(): 'polaroid' | 'kompakt' { return this._mode; }
  private _mode: 'polaroid' | 'kompakt' = 'polaroid';

  @HostBinding('class.mode-polaroid') get isPolaroid(): boolean { return this._mode === 'polaroid'; }
  @HostBinding('class.mode-kompakt') get isKompakt(): boolean { return this._mode === 'kompakt'; }
}
