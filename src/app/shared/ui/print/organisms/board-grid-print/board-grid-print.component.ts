import { Component, HostBinding } from '@angular/core';

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
      align-items: stretch;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `]
})
export class BoardGridPrintComponent {
  @HostBinding('class.mode-polaroid') readonly isPolaroid = true;
}
