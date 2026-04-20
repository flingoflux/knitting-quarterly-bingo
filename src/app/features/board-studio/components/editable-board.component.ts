import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCell } from '../../../shared/domain/board-cell';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../shared/ports/image-repository';

interface ProjectEditedEvent {
  index: number;
  project: BoardCell;
}

interface CardDetailOpenedEvent {
  index: number;
  project: BoardCell;
}

@Component({
  selector: 'app-editable-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid editable" [class.mode-polaroid]="mode === 'polaroid'" [class.mode-horizontal]="mode === 'horizontal'">
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
        <div class="photo-area" [class.is-editing]="editingIndex === i">
          <img *ngIf="getImage(p.imageId)" [src]="getImage(p.imageId)" class="photo-img" [alt]="p.title" />
          <div *ngIf="!getImage(p.imageId)" class="photo-placeholder">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <button
            type="button"
            class="photo-btn"
            title="Foto ansehen / hochladen"
            aria-label="Foto ansehen oder hochladen"
            (click)="openDetail(i, p, $event)"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>

        <div class="caption">
          <button
            type="button"
            class="edit-btn"
            title="Projekt bearbeiten"
            aria-label="Projekt bearbeiten"
            (click)="startEditing(i, p, $event)"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
          </button>

          <ng-container *ngIf="editingIndex === i; else readonlyView">
            <input
              class="title-input"
              [value]="getDraftTitle(i, p.title)"
              (input)="onDraftTitleInput(i, $event)"
              (keydown.enter)="saveAndExit(i, p)"
            />
          </ng-container>

          <ng-template #readonlyView>
            <div class="title">{{p.title}}</div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Gemeinsame Basis ── */
    .grid.editable {
      display: grid;
      gap: 0.6rem;
      margin: 0.5rem auto 0;
    }
    .cell {
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 5px rgba(60, 30, 10, 0.14), 0 8px 20px rgba(60, 30, 10, 0.10);
      cursor: grab;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .cell:hover {
      transform: translateY(-3px) rotate(0.3deg);
      box-shadow: 0 6px 14px rgba(60, 30, 10, 0.18), 0 16px 32px rgba(60, 30, 10, 0.13);
    }
    .cell.drag-target {
      outline: 2px dashed #b56a39;
      outline-offset: 3px;
      transform: translateY(-2px);
    }
    .photo-area {
      position: relative;
      background: #f2e8d8;
      overflow: hidden;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }
    .photo-area.is-editing {
      opacity: 0.45;
    }
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9a878;
    }
    .photo-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      border: 1.5px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      width: 26px;
      height: 26px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: #5a2d1a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: background 0.18s, transform 0.15s;
    }
    .photo-btn:hover,
    .photo-btn:focus-visible {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.1);
    }
    .photo-btn:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.5);
      outline-offset: 2px;
    }
    .caption {
      background: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .title {
      font-weight: 700;
      color: #4a2d1c;
      line-height: 1.25;
      text-wrap: balance;
    }
    .edit-btn {
      position: absolute;
      right: 5px;
      top: 5px;
      border: 1px solid #e0c8ac;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      background: #fffaf4;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: transform 0.18s ease, background 0.2s;
    }
    .edit-btn:hover,
    .edit-btn:focus-visible {
      transform: translateY(-1px);
      background: #ffe8cd;
    }
    .edit-btn:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .title-input {
      border: 1px solid #d0ab86;
      border-radius: 7px;
      padding: 0.3rem 0.5rem;
      background: #fffdf9;
      color: #3f2a1d;
      font-weight: 600;
      text-align: center;
    }
    .title-input:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.28);
      outline-offset: 1px;
    }

    /* ── Option B: Polaroid ── */
    .grid.editable.mode-polaroid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 52rem;
    }
    .mode-polaroid .cell {
      padding: 7px 7px 0;
      border-radius: 5px;
    }
    .mode-polaroid .photo-area {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 2px;
    }
    .mode-polaroid .caption {
      padding: 0.45rem 0.2rem 0.6rem;
      align-items: center;
      min-height: 44px;
    }
    .mode-polaroid .title {
      font-size: 0.74rem;
      text-align: center;
      padding: 0 1.5rem;
      margin-top: 0.1rem;
    }
    .mode-polaroid .title-input {
      width: calc(100% - 2rem);
      font-size: 0.82rem;
      margin-top: 0.25rem;
    }

    /* ── Option A: Horizontal ── */
    .grid.editable.mode-horizontal {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 58rem;
      gap: 0.4rem;
    }
    .mode-horizontal .cell {
      flex-direction: row;
      align-items: stretch;
      height: 4.8rem;
    }
    .mode-horizontal .cell:hover {
      transform: translateY(-2px) rotate(0deg);
    }
    .mode-horizontal .photo-area {
      width: 4.8rem;
      height: 4.8rem;
      aspect-ratio: unset;
      flex-shrink: 0;
    }
    .mode-horizontal .caption {
      flex: 1;
      align-items: flex-start;
      justify-content: center;
      padding: 0.35rem 2rem 0.35rem 0.45rem;
      overflow: hidden;
    }
    .mode-horizontal .title {
      font-size: 0.7rem;
      text-align: left;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .mode-horizontal .photo-btn {
      width: 22px;
      height: 22px;
      bottom: 4px;
      right: 4px;
    }
    .mode-horizontal .title-input {
      width: calc(100% - 0.5rem);
      font-size: 0.72rem;
      padding: 0.2rem 0.4rem;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .grid.editable.mode-polaroid,
      .grid.editable.mode-horizontal {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .mode-horizontal .cell {
        height: 5.2rem;
      }
      .mode-horizontal .photo-area {
        width: 5.2rem;
        height: 5.2rem;
      }
    }
    @media (max-width: 520px) {
      .grid.editable.mode-polaroid,
      .grid.editable.mode-horizontal {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EditableBoardComponent {
  private readonly el = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);

  private _projects: BoardCell[] = [];
  @Input() set projects(value: BoardCell[]) {
    this._projects = value;
    void this.loadAllImages();
  }
  get projects(): BoardCell[] { return this._projects; }

  @Input() mode: 'polaroid' | 'horizontal' = 'polaroid';
  @Input() dragTargetIndex!: number | null;
  @Output() dragStarted = new EventEmitter<number>();
  @Output() dragOverCell = new EventEmitter<number>();
  @Output() dragLeftCell = new EventEmitter<number>();
  @Output() droppedOnCell = new EventEmitter<number>();
  @Output() projectEdited = new EventEmitter<ProjectEditedEvent>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();

  editingIndex: number | null = null;
  private readonly imageCache = new Map<string, string>();
  private readonly draftTitles = new Map<number, string>();

  getImage(imageId: string | undefined): string | null {
    if (!imageId) return null;
    return this.imageCache.get(imageId) ?? null;
  }

  async refreshImage(imageId: string | null): Promise<void> {
    if (!imageId) return;
    const url = await this.imageRepo.getImage(imageId);
    if (url) {
      this.imageCache.set(imageId, url);
    } else {
      this.imageCache.delete(imageId);
    }
    this.cdr.markForCheck();
  }

  private async loadAllImages(): Promise<void> {
    const imageIds = this._projects
      .map(p => p.imageId)
      .filter((id): id is string => !!id);
    const uniqueIds = [...new Set(imageIds)];
    await Promise.all(
      uniqueIds.map(async id => {
        const url = await this.imageRepo.getImage(id);
        if (url) {
          this.imageCache.set(id, url);
        } else {
          this.imageCache.delete(id);
        }
      })
    );
    this.cdr.markForCheck();
  }

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
  }

  onDraftTitleInput(i: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draftTitles.set(i, target.value);
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
    const updatedProject: BoardCell = { title, imageId: project.imageId };

    if (!this.isSameProject(project, updatedProject)) {
      this.projectEdited.emit({ index: i, project: updatedProject });
    }

    this.draftTitles.set(i, title);
  }

  getDraftTitle(i: number, fallback: string): string {
    return this.draftTitles.get(i) ?? fallback;
  }

  private isSameProject(first: BoardCell, second: BoardCell): boolean {
    return first.title === second.title;
  }
}
