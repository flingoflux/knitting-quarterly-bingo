import { Component, Input, OnInit } from '@angular/core';
import { EditableBingoBoard } from './bingo-board';

@Component({
  selector: 'app-editable-board',
  standalone: true,
  template: `
    <div class="grid editable">
      <div
        *ngFor="let p of board.getProjects(); let i = index"
        class="cell"
        [class.done]="board.getDone()[i]"
        [class.drag-target]="dragTargetIndex === i"
        draggable="true"
        (dragstart)="dragStart(i)"
        (dragover)="$event.preventDefault(); dragOver(i)"
        (dragleave)="dragLeave(i)"
        (drop)="drop(i)"
      >
        <div class="cell-content">
          <div class="title">{{p.title}}</div>
          <div class="cat" [ngClass]="'cat-' + p.catKey">{{p.cat}}</div>
          <span class="drag-hint">⇅</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editable .drag-hint { position: absolute; right: 8px; top: 6px; color: #888; font-size: 1.2em; }
  `]
})
export class EditableBoardComponent implements OnInit {
  @Input() board!: EditableBingoBoard;
  @Input() dragTargetIndex!: number | null;
  @Input() dragStart!: (i: number) => void;
  @Input() dragOver!: (i: number) => void;
  @Input() dragLeave!: (i: number) => void;
  @Input() drop!: (i: number) => void;

  ngOnInit() {
    console.log('[EditableBoardComponent] Projekte:', this.board?.getProjects());
  }
}