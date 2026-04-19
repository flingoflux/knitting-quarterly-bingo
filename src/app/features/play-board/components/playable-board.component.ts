import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCell } from '../../../shared/domain/board-cell';

@Component({
  selector: 'app-playable-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid playable">
      <div
        *ngFor="let p of projects; let i = index"
        class="cell"
        [class.done]="done[i]"
        [class.bingo-cell]="isCellInBingo(i)"
        (click)="onToggle(i)"
      >
        <div class="cell-content">
          <div class="title">{{p.title}}</div>
          <div class="cats">
            <span *ngFor="let key of p.catKeys" class="cat" [ngClass]="'cat-' + key">{{categoryLabels[key] ?? key}}</span>
          </div>
          <span *ngIf="done[i]" class="done-check">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <span *ngIf="isCellInBingo(i)" class="bingo-star">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.grid.playable {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
      max-width: 70rem;
      margin: 1rem auto 0;
    }
    .cell {
      background: #fffaf2;
      border: 1px solid #d9b998;
      border-radius: 14px;
      min-height: 126px;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 26px rgba(96, 58, 30, 0.12);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      font-size: 1.02rem;
    }
    .cell:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 30px rgba(96, 58, 30, 0.16);
      border-color: #c79362;
    }
    .cell.done {
      background: #edf5e2;
      border-color: #a9c183;
    }
    .cell.bingo-cell {
      border: 2px solid #145906;
      box-shadow: 0 12px 26px rgba(96, 58, 30, 0.12);
    }
    .bingo-star {
      position: absolute;
      right: 8px;
      top: 6px;
      color: #145906;
      font-size: 1.35em;
      line-height: 1;
    }
    .cell.bingo-cell .done-check {
      display: none;
    }
    .cell-content {
      width: 100%;
      text-align: center;
      padding: 0.7rem 0.55rem;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      min-height: 100%;
    }
    .title {
      font-weight: 700;
      margin: 0.45rem 0 0.2rem;
      color: #4a2d1c;
      line-height: 1.25;
      text-wrap: balance;
    }
    .cat {
      font-size: 0.72rem;
      color: #5b4436;
      border-radius: 999px;
      border: 1px solid #d7b899;
      background: #fff3e2;
      padding: 0.15rem 0.55rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: auto;
    }
    .cats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      justify-content: center;
      margin-top: auto;
      padding-bottom: 0.1rem;
    }
    .cat-basics {
      background: #f5eadc;
    }
    .cat-technik {
      background: #ede8ff;
    }
    .cat-challenge {
      background: #ffe6dc;
    }
    .cat-accessoire {
      background: #e6f4ec;
    }
    .done-check {
      position: absolute;
      right: 8px;
      top: 8px;
      color: #3a6620;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.85;
    }
    @media (max-width: 960px) {
      .grid.playable {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 560px) {
      .grid.playable {
        grid-template-columns: 1fr;
      }
      .cell {
        min-height: 118px;
      }
    }
  `]
})
export class PlayableBoardComponent {
  readonly categoryLabels: Record<string, string> = {
    basics: 'Basics',
    technik: 'Technik',
    challenge: 'Challenge',
    accessoire: 'Accessoire',
  };
  @Input() projects: BoardCell[] = [];
  @Input() done: boolean[] = [];
  @Input() bingoCells: Set<number> = new Set<number>();
  @Output() toggled = new EventEmitter<number>();

  onToggle(i: number) {
    this.toggled.emit(i);
  }

  isCellInBingo(i: number): boolean {
    return this.bingoCells.has(i);
  }
}
