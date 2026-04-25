import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Atom: 4×4-Mini-Grid zur Visualisierung des Bingo-Fortschritts.
 * Zeigt 16 Zellen farblich als "offen", "erledigt" oder "Bingo".
 *
 * Verwendung:
 *   <kq-status-mini-grid [completed]="..." [bingoCells]="..." />
 */
@Component({
  selector: 'kq-status-mini-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-grid" [attr.aria-label]="ariaLabel">
      <div
        *ngFor="let done of completed; let i = index"
        class="status-cell"
        [class.done]="done"
        [class.bingo]="isBingo(i)"
        [attr.title]="challengeNames?.[i] ?? null"
      ></div>
    </div>
  `,
  styles: [`
    .status-grid {
      display: grid;
      grid-template-columns: repeat(4, 14px);
      grid-template-rows: repeat(4, 8px);
      gap: 3px;
    }

    .status-cell {
      width: 14px;
      height: 8px;
      border-radius: 2px;
      background: #fff;
      border: 1.5px solid var(--kq-status-cell-border, #d0b08a);
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .status-cell.done,
    .status-cell.bingo {
      background: var(--kq-done, #145906);
      border-color: var(--kq-done, #145906);
    }
  `],
})
export class StatusMiniGridComponent {
  @Input() completed: boolean[] = [];
  /** Akzeptiert sowohl Set<number> (aus BingoGame) als auch number[] (aus ArchiveEntry). */
  @Input() bingoCells: Set<number> | readonly number[] = new Set<number>();
  @Input() ariaLabel = 'Fortschritt';
  @Input() challengeNames?: string[];

  isBingo(index: number): boolean {
    if (this.bingoCells instanceof Set) {
      return this.bingoCells.has(index);
    }
    return (this.bingoCells as readonly number[]).includes(index);
  }
}
