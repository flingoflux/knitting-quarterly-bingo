import { Component, inject } from '@angular/core';
import { EditableBingoStateService } from './state/editable-bingo-state.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { shuffleArray } from '../../shared/utils/array-utils';
import { EditableProject } from './domain/editable-project';

@Component({
  selector: 'app-edit-board-feature',
  standalone: true,
  imports: [EditableBoardComponent],
  template: `
    <div class="edit-board-header">
      <h2>Knitting Quarterly Bingo planen</h2>
      <p class="subtitle">Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden!</p>
    </div>
    <button (click)="shuffle()">Felder würfeln</button>
    <app-editable-board
      [board]="board"
      [dragTargetIndex]="dragTargetIndex"
      [dragStart]="dragStart"
      [dragOver]="dragOver"
      [dragLeave]="dragLeave"
      [drop]="drop"
    ></app-editable-board>
  `,
  styles: [
    `.edit-board-header { text-align: center; margin-bottom: 1.5rem; }`,
    `.edit-board-header .subtitle { color: #666; font-size: 1.1rem; margin-top: 0.5rem; }`
  ],
})
export class EditBoardFeatureComponent {
  state = inject(EditableBingoStateService);
  dragTargetIndex: number | null = null;
  dragStartIndex: number | null = null;

  get board() {
    return this.state.getBoard();
  }

  shuffle() {
    const projects = this.board.getProjects();
    const shuffled = shuffleArray(projects);
    this.state.setProjects(shuffled as EditableProject[]);
  }

  dragStart = (i: number) => {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  };
  dragOver = (i: number) => {
    if (this.dragStartIndex !== null) {
      this.dragTargetIndex = i;
    }
  };
  dragLeave = (_i: number) => {
    this.dragTargetIndex = null;
  };
  drop = (i: number) => {
    if (this.dragStartIndex !== null && this.dragStartIndex !== i) {
      this.board.swapProjects(this.dragStartIndex, i);
      this.state.setProjects([...this.board.getProjects()]);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  };
}
