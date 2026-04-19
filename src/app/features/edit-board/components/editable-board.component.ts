import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCell } from '../../../shared/domain/board-cell';

interface CategoryOption {
  label: string;
  key: string;
}

interface ProjectEditedEvent {
  index: number;
  project: BoardCell;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Basics', key: 'basics' },
  { label: 'Technik', key: 'technik' },
  { label: 'Challenge', key: 'challenge' },
  { label: 'Accessoire', key: 'accessoire' },
];

@Component({
  selector: 'app-editable-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid editable">
      <div
        *ngFor="let p of projects; let i = index"
        class="cell"
        [class.drag-target]="dragTargetIndex === i"
        [attr.draggable]="editingIndex === i ? 'false' : 'true'"
        (dragstart)="onDragStart(i, $event)"
        (dragover)="$event.preventDefault(); onDragOver(i)"
        (dragleave)="onDragLeave(i)"
        (drop)="onDrop(i)"
      >
        <button
          type="button"
          class="edit-btn"
          title="Projekt bearbeiten"
          aria-label="Projekt bearbeiten"
          (click)="startEditing(i, p, $event)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        </button>

        <div class="cell-content" (focusout)="onCellFocusOut(i, p, $event)">
          <ng-container *ngIf="editingIndex === i; else readonlyView">
            <input
              class="title-input"
              [value]="getDraftTitle(i, p.title)"
              (input)="onDraftTitleInput(i, $event)"
              (blur)="saveProject(i, p)"
              (keydown.enter)="saveProject(i, p)"
            />

            <select
              class="cat-select"
              [value]="getDraftCatKey(i, p.catKey)"
              (change)="onDraftCategoryChange(i, $event)"
              (blur)="saveProject(i, p)"
            >
              <option *ngFor="let option of categoryOptions" [value]="option.key">{{option.label}}</option>
            </select>
          </ng-container>

          <ng-template #readonlyView>
            <div class="title">{{p.title}}</div>
            <div class="cat" [ngClass]="'cat-' + p.catKey">{{p.cat}}</div>
          </ng-template>
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
      position: relative;
      display: grid;
      justify-items: center;
      gap: 0.45rem;
    }
    .title {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
    .cat {
      font-size: 0.9em;
      color: #666;
    }
    .edit-btn {
      position: absolute;
      right: 6px;
      top: 6px;
      border: 1px solid #d0d0d0;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      background: #fff;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: background 0.2s, color 0.2s;
    }
    .edit-btn:hover,
    .edit-btn:focus {
      background: #f3f3f3;
      color: #222;
      outline: none;
    }
    .title-input,
    .cat-select {
      width: calc(100% - 1rem);
      border: 1px solid #cfcfcf;
      border-radius: 6px;
      padding: 0.35rem 0.5rem;
      font-size: 0.95rem;
      background: #fff;
      color: #333;
    }
    .title-input {
      margin-top: 1.2rem;
      text-align: center;
      font-weight: 600;
    }
    .cat-select {
      margin-bottom: 0.2rem;
    }
    .editable .drag-hint { position: absolute; right: 8px; top: 6px; color: #888; font-size: 1.2em; }
  `]
})
export class EditableBoardComponent {
  readonly categoryOptions = CATEGORY_OPTIONS;
  @Input() projects: BoardCell[] = [];
  @Input() dragTargetIndex!: number | null;
  @Output() dragStarted = new EventEmitter<number>();
  @Output() dragOverCell = new EventEmitter<number>();
  @Output() dragLeftCell = new EventEmitter<number>();
  @Output() droppedOnCell = new EventEmitter<number>();
  @Output() projectEdited = new EventEmitter<ProjectEditedEvent>();

  editingIndex: number | null = null;
  private readonly draftTitles = new Map<number, string>();
  private readonly draftCategoryKeys = new Map<number, string>();

  onDragStart(i: number, event: DragEvent) {
    if (this.editingIndex === i) {
      event.preventDefault();
      return;
    }

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

  startEditing(i: number, project: BoardCell, event: MouseEvent): void {
    event.stopPropagation();
    this.editingIndex = i;
    this.draftTitles.set(i, project.title);
    this.draftCategoryKeys.set(i, project.catKey);
  }

  onDraftTitleInput(i: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draftTitles.set(i, target.value);
  }

  onDraftCategoryChange(i: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.draftCategoryKeys.set(i, target.value);
  }

  onCellFocusOut(i: number, project: BoardCell, event: FocusEvent): void {
    if (this.editingIndex !== i) {
      return;
    }

    const nextFocusedElement = event.relatedTarget as Node | null;
    const currentCellElement = event.currentTarget as HTMLElement;
    if (nextFocusedElement !== null && currentCellElement.contains(nextFocusedElement)) {
      return;
    }

    this.saveProject(i, project);
    this.editingIndex = null;
  }

  saveProject(i: number, project: BoardCell): void {
    if (this.editingIndex !== i) {
      return;
    }

    const draftTitle = this.getDraftTitle(i, project.title).trim();
    const title = draftTitle.length > 0 ? draftTitle : project.title;
    const catKey = this.getDraftCatKey(i, project.catKey);
    const cat = this.getCategoryLabel(catKey) ?? project.cat;
    const updatedProject: BoardCell = { title, cat, catKey };

    if (!this.isSameProject(project, updatedProject)) {
      this.projectEdited.emit({
        index: i,
        project: updatedProject,
      });
    }

    this.draftTitles.set(i, title);
    this.draftCategoryKeys.set(i, catKey);
  }

  getDraftTitle(i: number, fallback: string): string {
    return this.draftTitles.get(i) ?? fallback;
  }

  getDraftCatKey(i: number, fallback: string): string {
    return this.draftCategoryKeys.get(i) ?? fallback;
  }

  private getCategoryLabel(key: string): string | undefined {
    return this.categoryOptions.find((option) => option.key === key)?.label;
  }

  private isSameProject(first: BoardCell, second: BoardCell): boolean {
    return first.title === second.title && first.cat === second.cat && first.catKey === second.catKey;
  }
}
