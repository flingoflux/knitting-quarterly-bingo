import { Component, inject } from '@angular/core';
import { EditBoardStateService } from './state/edit-board-state.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { shuffleArray } from '../../shared/utils/array-utils';
import { BoardCell } from '../../shared/domain/board-cell';
import { Router } from '@angular/router';
import { BoardTransferState } from '../../shared/navigation/board-transfer-state';

@Component({
  selector: 'app-edit-board-feature',
  standalone: true,
  imports: [EditableBoardComponent],
  template: `
    <div class="button-bar">
      <button class="icon-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7"/>
          <path d="M9 22V12h6v10"/>
          <path d="M21 22H3"/>
        </svg>
      </button>
      <button class="icon-btn" (click)="shuffle()" title="Felder würfeln" aria-label="Felder würfeln">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 3 21 3 21 8"/>
          <line x1="4" y1="20" x2="21" y2="3"/>
          <polyline points="21 16 21 21 16 21"/>
          <line x1="15" y1="15" x2="21" y2="21"/>
        </svg>
      </button>
      <button class="icon-btn" (click)="playBoard()" title="Als Bingo spielen" aria-label="Als Bingo spielen">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </button>
    </div>
    <div class="edit-board-header">
      <h2>Knitting Quarterly Bingo planen</h2>
      <p class="subtitle">Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden!</p>
    </div>
    <app-editable-board
      [board]="board"
      [dragTargetIndex]="dragTargetIndex"
      (dragStarted)="onDragStart($event)"
      (dragOverCell)="onDragOver($event)"
      (dragLeftCell)="onDragLeave($event)"
      (droppedOnCell)="onDrop($event)"
    ></app-editable-board>
  `,
  styles: [`
    .button-bar {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      position: absolute;
      top: 1.2rem;
      left: 1.2rem;
      z-index: 20;
    }
    .icon-btn {
      background: none;
      border: none;
      padding: 0.2rem;
      margin: 0;
      cursor: pointer;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .icon-btn:focus {
      outline: 2px solid #888;
      background: #f0f0f0;
    }
    .icon-btn:hover {
      background: #f5f5f5;
    }
    .edit-board-header {
      text-align: center;
      margin-bottom: 1.5rem;
      position: relative;
      margin-top: 4.5rem;
    }
    .edit-board-header .subtitle { color: #666; font-size: 1.1rem; margin-top: 0.5rem; }
    .grid.editable {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      max-width: 600px;
      margin: 2rem auto;
    }
    .cell {
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      min-height: 120px;
      min-width: 160px;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      cursor: grab;
      transition: box-shadow 0.2s;
      font-size: 1.1rem;
    }
    .cell.drag-target {
      outline: 2px dashed #888;
      background: #f0f0f0;
    }
    .cell-content {
      width: 100%;
      text-align: center;
      padding: 0.5rem;
    }
    .title {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
    .cat {
      font-size: 0.9em;
      color: #666;
    }
    .editable .drag-hint { position: absolute; right: 8px; top: 6px; color: #888; font-size: 1.2em; }
  `],
})
export class EditBoardFeatureComponent {
  state = inject(EditBoardStateService);
  router = inject(Router);
  dragTargetIndex: number | null = null;
  dragStartIndex: number | null = null;

  get board() {
    return this.state.getBoard();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  shuffle() {
    const projects = this.board.getProjects();
    const shuffled = shuffleArray(projects);
    this.state.setProjects(shuffled as BoardCell[]);
  }

  playBoard() {
    const state: BoardTransferState = {
      projects: this.board.getProjects().map(p => ({ title: p.title, cat: p.cat, catKey: p.catKey }))
    };
    this.router.navigate(['/play'], { state });
  }

  onDragStart(i: number) {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  }

  onDragOver(i: number) {
    if (this.dragStartIndex !== null) {
      this.dragTargetIndex = i;
    }
  }

  onDragLeave(_i: number) {
    this.dragTargetIndex = null;
  }

  onDrop(i: number) {
    if (this.dragStartIndex !== null && this.dragStartIndex !== i) {
      this.board.swapProjects(this.dragStartIndex, i);
      this.state.setProjects([...this.board.getProjects()]);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  }
}
