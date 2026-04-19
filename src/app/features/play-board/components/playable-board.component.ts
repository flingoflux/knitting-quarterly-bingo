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
          <div class="cat" [ngClass]="'cat-' + p.catKey">{{p.cat}}</div>
          <span *ngIf="done[i]" class="done-check">✓</span>
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
      background: #ecf9f0;
      border-color: #6da07d;
    }
    .cell.bingo-cell {
      background: #fff0d7;
      border-color: #c46e35;
      box-shadow: 0 0 0 2px rgba(196, 110, 53, 0.28), 0 18px 30px rgba(96, 58, 30, 0.2);
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
      color: #2f7a49;
      font-size: 1.25em;
      font-weight: bold;
      background: #effbf3;
      border: 1px solid #90c29f;
      width: 1.55rem;
      height: 1.55rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
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
