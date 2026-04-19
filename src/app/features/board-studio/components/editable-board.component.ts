import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
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

interface CardDetailOpenedEvent {
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
          class="photo-btn"
          title="Foto ansehen / hochladen"
          aria-label="Foto ansehen oder hochladen"
          (click)="openDetail(i, p, $event)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>

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

        <div class="cell-content">
          <ng-container *ngIf="editingIndex === i; else readonlyView">
            <input
              class="title-input"
              [value]="getDraftTitle(i, p.title)"
              (input)="onDraftTitleInput(i, $event)"
              (keydown.enter)="saveAndExit(i, p)"
            />

            <div class="chips">
              <button
                *ngFor="let option of categoryOptions"
                type="button"
                class="chip"
                [class.chip-active]="isDraftCatKeySelected(i, p.catKeys, option.key)"
                [ngClass]="'chip-' + option.key"
                (click)="toggleDraftCategory(i, p.catKeys, option.key, $event)"
              >{{option.label}}</button>
            </div>
          </ng-container>

          <ng-template #readonlyView>
            <div class="title">{{p.title}}</div>
            <div class="cats">
              <span
                *ngFor="let key of p.catKeys"
                class="cat"
                [ngClass]="'cat-' + key"
              >{{getCategoryLabel(key)}}</span>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid.editable {
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
      min-height: 156px;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 26px rgba(96, 58, 30, 0.12);
      cursor: grab;
      transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      font-size: 1.02rem;
    }
    .cell:hover {
      box-shadow: 0 0 0 3px rgba(196, 110, 53, 0.2), 0 12px 26px rgba(96, 58, 30, 0.14);
      border-color: #c79362;
    }
    .cell.drag-target {
      outline: 2px dashed #b56a39;
      outline-offset: 3px;
      background: #fff3e2;
      transform: translateY(-2px);
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
      margin: 2rem 0 0.2rem;
      color: #4a2d1c;
      line-height: 1.25;
      text-wrap: balance;
    }
    .cats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      justify-content: center;
      margin-top: auto;
      padding-bottom: 0.2rem;
    }
    .cat {
      font-size: 0.52rem;
      color: #fff;
      border-radius: 999px;
      border: none;
      background: #888;
      padding: 0.1rem 0.45rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .cat-basics { background: #ffa600; }
    .cat-technik { background: #1cb3f4; }
    .cat-challenge { background: #c44020; }
    .cat-accessoire { background: #5aaa2a; }
    .photo-btn {
      position: absolute;
      left: 8px;
      top: 6px;
      border: 1px solid #cf9f75;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      background: #fff4e6;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: transform 0.18s ease, background 0.2s, color 0.2s;
    }
    .photo-btn:hover,
    .photo-btn:focus-visible {
      transform: translateY(-1px);
      background: #ffe8cd;
      color: #532615;
    }
    .photo-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .edit-btn {
      position: absolute;
      right: 8px;
      top: 6px;
      border: 1px solid #cf9f75;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      background: #fff4e6;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: transform 0.18s ease, background 0.2s, color 0.2s;
    }
    .edit-btn:hover,
    .edit-btn:focus-visible {
      transform: translateY(-1px);
      background: #ffe8cd;
      color: #532615;
    }
    .edit-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .title-input {
      width: calc(100% - 1rem);
      border: 1px solid #d0ab86;
      border-radius: 9px;
      padding: 0.4rem 0.6rem;
      font-size: 0.9rem;
      background: #fffdf9;
      color: #3f2a1d;
      margin-top: 2rem;
      text-align: center;
      font-weight: 600;
    }
    .title-input:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.28);
      outline-offset: 1px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      justify-content: center;
      padding: 0 0.25rem 0.2rem;
    }
    .chip {
      font-size: 0.52rem;
      border-radius: 999px;
      border: 1px solid #d0ab86;
      background: #fffaf2;
      color: #a07850;
      padding: 0.1rem 0.45rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .chip:hover {
      border-color: #b87a45;
      color: #7b4a20;
    }
    .chip.chip-active.chip-basics {
      background: #ffa600;
      border-color: #ffa600;
      color: #fff;
    }
    .chip.chip-active.chip-technik {
      background: #1cb3f4;
      border-color: #1cb3f4;
      color: #fff;
    }
    .chip.chip-active.chip-challenge {
      background: #c44020;
      border-color: #c44020;
      color: #fff;
    }
    .chip.chip-active.chip-accessoire {
      background: #5aaa2a;
      border-color: #5aaa2a;
      color: #fff;
    }
    @media (max-width: 960px) {
      .grid.editable {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 560px) {
      .grid.editable {
        grid-template-columns: 1fr;
      }
      .cell {
        min-height: 148px;
      }
    }
  `]
})
export class EditableBoardComponent {
  private readonly el = inject(ElementRef);
  readonly categoryOptions = CATEGORY_OPTIONS;
  @Input() projects: BoardCell[] = [];
  @Input() dragTargetIndex!: number | null;
  @Output() dragStarted = new EventEmitter<number>();
  @Output() dragOverCell = new EventEmitter<number>();
  @Output() dragLeftCell = new EventEmitter<number>();
  @Output() droppedOnCell = new EventEmitter<number>();
  @Output() projectEdited = new EventEmitter<ProjectEditedEvent>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();

  editingIndex: number | null = null;
  private readonly draftTitles = new Map<number, string>();
  private readonly draftCategoryKeys = new Map<number, string[]>();

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.editingIndex === null) return;
    const target = event.target as Node;
    const cells = this.el.nativeElement.querySelectorAll('.cell');
    const editingCell = cells[this.editingIndex] as HTMLElement | undefined;
    if (editingCell && !editingCell.contains(target)) {
      this.saveAndExit(this.editingIndex, this.projects[this.editingIndex]);
    }
  }

  openDetail(i: number, project: BoardCell, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, project });
  }

  startEditing(i: number, project: BoardCell, event: MouseEvent): void {
    event.stopPropagation();
    if (this.editingIndex === i) {
      this.saveAndExit(i, project);
      return;
    }
    if (this.editingIndex !== null) {
      this.saveAndExit(this.editingIndex, this.projects[this.editingIndex]);
    }
    this.editingIndex = i;
    this.draftTitles.set(i, project.title);
    this.draftCategoryKeys.set(i, [...project.catKeys]);
  }

  onDraftTitleInput(i: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draftTitles.set(i, target.value);
  }

  toggleDraftCategory(i: number, fallbackCatKeys: string[], key: string, event: MouseEvent): void {
    event.stopPropagation();
    const current = this.draftCategoryKeys.get(i) ?? [...fallbackCatKeys];
    const idx = current.indexOf(key);
    if (idx === -1) {
      this.draftCategoryKeys.set(i, [...current, key]);
    } else {
      if (current.length === 1) return;
      this.draftCategoryKeys.set(i, current.filter((k) => k !== key));
    }
  }

  isDraftCatKeySelected(i: number, fallbackCatKeys: string[], key: string): boolean {
    const keys = this.draftCategoryKeys.get(i) ?? fallbackCatKeys;
    return keys.includes(key);
  }

  saveAndExit(i: number, project: BoardCell): void {
    this.saveProject(i, project);
    this.editingIndex = null;
  }

  saveProject(i: number, project: BoardCell): void {
    if (this.editingIndex !== i) {
      return;
    }

    const draftTitle = this.getDraftTitle(i, project.title).trim();
    const title = draftTitle.length > 0 ? draftTitle : project.title;
    const catKeys = this.draftCategoryKeys.get(i) ?? [...project.catKeys];
    const updatedProject: BoardCell = { title, catKeys };

    if (!this.isSameProject(project, updatedProject)) {
      this.projectEdited.emit({ index: i, project: updatedProject });
    }

    this.draftTitles.set(i, title);
    this.draftCategoryKeys.set(i, catKeys);
  }

  getDraftTitle(i: number, fallback: string): string {
    return this.draftTitles.get(i) ?? fallback;
  }

  getCategoryLabel(key: string): string {
    return CATEGORY_OPTIONS.find((o) => o.key === key)?.label ?? key;
  }

  private isSameProject(first: BoardCell, second: BoardCell): boolean {
    return (
      first.title === second.title &&
      first.catKeys.length === second.catKeys.length &&
      first.catKeys.every((k) => second.catKeys.includes(k))
    );
  }
}
