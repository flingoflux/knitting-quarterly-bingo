import { Component, Input } from '@angular/core';
import { PlayableBingoBoard } from './bingo-board';

@Component({
  selector: 'app-playable-board',
  standalone: true,
  template: `
    <div class="grid playable">
      <div
        *ngFor="let p of board.getProjects(); let i = index"
        class="cell"
        [class.done]="board.getDone()[i]"
        [class.bingo-cell]="isCellInBingo(i)"
        (click)="toggle(i)"
      >
        <div class="cell-content">
          <span *ngIf="isCellInBingo(i)" class="bingo-check">✔️</span>
          <div class="title">{{p.title}}</div>
          <div class="cat" [ngClass]="'cat-' + p.catKey">{{p.cat}}</div>
        </div>
      </div>
    </div>
  `
})
export class PlayableBoardComponent {
  @Input() board!: PlayableBingoBoard;
  @Input() isCellInBingo!: (i: number) => boolean;
  @Input() toggle!: (i: number) => void;
}
