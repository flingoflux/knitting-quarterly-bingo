import { Component, HostBinding, Input } from '@angular/core';

/**
 * Print-only 4×4 board grid.
 * Kein responsives Layout, keine Screen-Breakpoints.
 * Stets 4 Spalten – optimiert für A4-Druck.
 */
@Component({
  selector: 'kq-print-board-grid',
  standalone: true,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.5rem;
      width: 100%;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    :host(.mode-kompakt) {
      gap: 0.4rem;
    }
  `]
})
export class BoardGridPrintComponent {
  @Input() set mode(value: 'polaroid' | 'kompakt') {
    this._mode = value;
  }
  get mode(): 'polaroid' | 'kompakt' { return this._mode; }
  private _mode: 'polaroid' | 'kompakt' = 'polaroid';

  @HostBinding('class.mode-polaroid') get isPolaroid(): boolean { return this._mode === 'polaroid'; }
  @HostBinding('class.mode-kompakt') get isKompakt(): boolean { return this._mode === 'kompakt'; }
}
