import { Component, Input, OnInit } from '@angular/core';
import { EditableBingoBoard } from '../domain/editable-bingo-board';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editable-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid editable">
      <div
        *ngFor="let p of board.getProjects(); let i = index"
        class="cell"
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
    .grid.editable {
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
