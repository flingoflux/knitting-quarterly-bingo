import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BingoStateService } from './bingo-state.service';
import { BingoDragService } from './bingo-drag.service';
import { EditableBoardComponent } from './editable-board.component';
import { PlayableBoardComponent } from './playable-board.component';

@Component({
  selector: 'app-bingo',
  standalone: true,
  imports: [CommonModule, NgIf, EditableBoardComponent, PlayableBoardComponent],
  template: `
    <div class="board-header">
      <button class="home-btn" (click)="goHome()" title="Zur Startseite">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#256029" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 4l9 5.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>
      <h2>Knitting Bingo</h2>
    </div>

    <ng-container *ngIf="mode === 'edit'; else playBoard">
      <ng-container *ngIf="board && board.getProjects().length > 0">
        <app-editable-board
          [board]="board"
          [dragTargetIndex]="dragTargetIndex"
          [dragStart]="dragStart.bind(this)"
          [dragOver]="dragOver.bind(this)"
          [dragLeave]="dragLeave.bind(this)"
          [drop]="drop.bind(this)"
        ></app-editable-board>
      </ng-container>
    </ng-container>
    <ng-template #playBoard>
      <app-playable-board
        [board]="board"
        [isCellInBingo]="isCellInBingo.bind(this)"
        [toggle]="toggle.bind(this)"
      ></app-playable-board>
    </ng-template>

    <div class="actions">
      <button (click)="resetLocalStorage()">Lokalen Speicher zurücksetzen</button>
      <button (click)="reset()">Zurücksetzen</button>
      <button (click)="shuffle()">Felder würfeln</button>
      <button (click)="play()">Bingo spielen</button>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .cell {
        border: 1px solid #ccc;
        padding: 10px;
        min-height: 80px;
        text-align: center;
        cursor: pointer;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 80px;
        min-width: 0;
        position: relative;
        overflow: hidden;
        background: #fff;
        transition:
          box-shadow 0.2s,
          border 0.2s;
      }

      .bingo-cell {
        background: #256029 !important;
        color: #fff !important;
        border: none !important;
        box-shadow: 0 0 6px 1.5px #25602966;
        border-radius: 16px;
        position: relative;
        transition:
          box-shadow 0.3s,
          background 0.3s,
          color 0.3s;
        z-index: 2;
      }
      .bingo-cell .title,
      .bingo-cell .cat {
        color: #fff !important;
      }

      .bingo-cell .bingo-check {
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 1.3em;
        color: #4caf50;
        opacity: 0.85;
        pointer-events: none;
        filter: drop-shadow(0 1px 2px #fff8);
      }

      .cell-content {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .title {
        width: 100%;
        text-align: center;
        z-index: 1;
      }

      .cat {
        position: absolute;
        left: 0;
        bottom: 0px;
        width: 100%;
        text-align: center;
        font-size: 10px;
        margin: 0;
        pointer-events: none;
        z-index: 2;
        background: transparent;
      }

      .cell.drag-target {
        border: 1px dashed #222 !important;
        outline: none;
        background-color: inherit;
        box-shadow: none;
      }
      .cell.done {
        background: #d4edda;
      }

      .cat {
        font-size: 10px;
        margin-top: 5px;
      }

      .cat-basics {
        color: #3b6d11;
      }
      .cat-technik {
        color: #185fa5;
      }
      .cat-accessoire {
        color: #854f0b;
      }
      .cat-challenge {
        color: #993556;
      }

      .banner {
        background: #d4edda;
        padding: 8px;
        margin-bottom: 10px;
        text-align: center;
      }
    `,
  ],
})
export class BingoComponent {
  bingoState = inject(BingoStateService);
  bingoDrag = inject(BingoDragService);
  router = inject(Router);
  goHome() {
    this.router.navigate(['/']);
  }


  get board() {
    const board = this.bingoState.state.board;
    // Logging für Debugging
    console.log('[BingoComponent] board:', board);
    if (board) {
      console.log('[BingoComponent] Projekte:', board.getProjects());
      console.log('[BingoComponent] Done:', board.getDone());
    }
    return board;
  }

  get mode() {
    return this.bingoState.state.mode;
  }


  isCellInBingo(index: number) {
    return this.bingoState.isCellInBingo(index);
  }


  toggle(index: number) {
    if (this.mode === 'play') {
      this.bingoState.toggle(index);
    }
  }


  reset() {
    if (this.mode === 'edit' || this.mode === 'play') {
      this.bingoState.reset();
    }
  }


  shuffle() {
    if (this.mode === 'edit') {
      this.bingoState.shuffle();
    }
  }


  dragStart(index: number) {
    if (this.mode === 'edit') {
      this.bingoDrag.dragStart(index);
    }
  }

  dragOver(index: number) {
    if (this.mode === 'edit') {
      this.bingoDrag.dragOver(index);
    }
  }

  dragLeave(index: number) {
    if (this.mode === 'edit') {
      this.bingoDrag.dragLeave(index);
    }
  }

  drop(index: number) {
    if (this.mode === 'edit') {
      const result = this.bingoDrag.drop(index, this.board.getProjects(), this.board.getDone());
      if (result) {
        this.bingoState.setProjectsAndDone(result.projects, result.done);
      }
    }
  }


  get dragTargetIndex() {
    return this.mode === 'edit' ? this.bingoDrag.getDragTargetIndex() : null;
  }

  startGame() {
    if (this.mode === 'edit') {
      this.bingoState.startGame();
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('bingo_state_angular');
    window.location.reload();
  }

  play() {
    this.bingoState.startGame();
  }
}
