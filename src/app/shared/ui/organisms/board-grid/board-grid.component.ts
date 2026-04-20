import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'kq-board-grid',
  standalone: true,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: grid;
      gap: 0.6rem;
      margin: 0.5rem auto 0;
    }
    :host(.mode-polaroid) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 52rem;
    }
    :host(.mode-horizontal) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 58rem;
      gap: 0.4rem;
    }
    @media (max-width: 900px) {
      :host(.mode-polaroid),
      :host(.mode-horizontal) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 520px) {
      :host(.mode-polaroid),
      :host(.mode-horizontal) {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BoardGridComponent {
  @Input() set mode(value: 'polaroid' | 'horizontal') {
    this._mode = value;
  }
  get mode(): 'polaroid' | 'horizontal' { return this._mode; }
  private _mode: 'polaroid' | 'horizontal' = 'polaroid';

  @HostBinding('class.mode-polaroid') get isPolaroid(): boolean { return this._mode === 'polaroid'; }
  @HostBinding('class.mode-horizontal') get isHorizontal(): boolean { return this._mode === 'horizontal'; }
}
