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
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      max-width: 820px;
      margin: 2rem auto;
    }
    .cell {
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      min-height: 120px;
      min-width: 200px;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      cursor: pointer;
      transition: box-shadow 0.2s, background 0.2s;
      font-size: 1.1rem;
    }
    .cell.done {
      background: #e0ffe0;
      border-color: #7ad67a;
    }
    .cell.bingo-cell {
      background: #e3f0ff;
      border-color: #3390ff;
      box-shadow: 0 0 8px 2px #3390ff55;
    }
    .cell-content {
      width: 100%;
      text-align: center;
      padding: 0.5rem;
      position: relative;
    }
    .title {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
    .cat {
      font-size: 0.9em;
      color: #666;
    }
    .done-check {
      position: absolute;
      right: 8px;
      top: 6px;
      color: #4caf50;
      font-size: 1.3em;
      font-weight: bold;
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
