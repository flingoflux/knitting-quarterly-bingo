import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditableBoard } from '../domain/editable-board';
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
        (dragstart)="onDragStart(i)"
        (dragover)="$event.preventDefault(); onDragOver(i)"
        (dragleave)="onDragLeave(i)"
        (drop)="onDrop(i)"
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
  @Input() board!: EditableBoard;
  @Input() dragTargetIndex!: number | null;
  @Output() dragStarted = new EventEmitter<number>();
  @Output() dragOverCell = new EventEmitter<number>();
  @Output() dragLeftCell = new EventEmitter<number>();
  @Output() droppedOnCell = new EventEmitter<number>();

  onDragStart(i: number) {
    this.dragStarted.emit(i);
  }

  onDragOver(i: number) {
    this.dragOverCell.emit(i);
  }

  onDragLeave(i: number) {
    this.dragLeftCell.emit(i);
  }

  onDrop(i: number) {
    this.droppedOnCell.emit(i);
  }

  ngOnInit() {
    console.log('[EditableBoardComponent] Projekte:', this.board?.getProjects());
  }
}
