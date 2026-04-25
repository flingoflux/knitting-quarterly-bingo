import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../shared/domain/challenge';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';

interface ChallengeEditedEvent {
  index: number;
  challenge: Challenge;
}

interface CardDetailOpenedEvent {
  index: number;
  challenge: Challenge;
}

interface ReorderRequestedEvent {
  from: number;
  to: number;
}

@Component({
  selector: 'app-mobile-editable-board',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Read-only Kompakt-Liste -->
    @if (!editMode()) {
      <div class="compact-list">
        @for (p of challenges; track p.name; let i = $index) {
          <div class="compact-card">
            <div class="compact-card__photo">
              <img *ngIf="getImage(p.imageId)" [src]="getImage(p.imageId)" [alt]="p.name" class="compact-card__img" draggable="false" />
              <div *ngIf="!getImage(p.imageId)" class="compact-card__placeholder">
                <img src="assets/crown.svg" alt="" class="compact-card__logo" draggable="false" />
              </div>
            </div>
            <span class="compact-card__name">{{ p.name }}</span>
          </div>
        }
      </div>
    }

    <!-- Edit-Liste mit Umbenennungs-, Foto- und Sortierfunktion -->
    @if (editMode()) {
      <div class="edit-list">
        @for (p of challenges; track p.name; let i = $index) {
          <div class="edit-card">
            <div class="edit-card__photo" (click)="openDetail(i, p, $event)">
              <img *ngIf="getImage(p.imageId)" [src]="getImage(p.imageId)" [alt]="p.name" class="edit-card__img" draggable="false" />
              <div *ngIf="!getImage(p.imageId)" class="edit-card__placeholder">
                <img src="assets/crown.svg" alt="" class="edit-card__logo" draggable="false" />
              </div>
              <div class="edit-card__camera-hint">
                <kq-icon name="camera" [size]="16"/>
              </div>
            </div>

            <div class="edit-card__body">
              @if (editingIndex === i) {
                <input
                  class="edit-card__input"
                  [value]="getDraftName(i, p.name)"
                  (input)="onDraftNameInput(i, $event)"
                  (keydown.enter)="saveAndExit(i, p)"
                  (keydown.escape)="cancelEditing()"
                  placeholder="Projektname"
                />
              } @else {
                <span class="edit-card__name">{{ p.name }}</span>
              }
            </div>

            <div class="edit-card__actions">
              <button
                type="button"
                class="icon-btn"
                [class.icon-btn--active]="editingIndex === i"
                title="Umbenennen"
                aria-label="Projekt umbenennen"
                (click)="startEditing(i, p, $event)"
              >
                <kq-icon [name]="editingIndex === i ? 'check' : 'edit'" [size]="16"/>
              </button>
              <button
                type="button"
                class="icon-btn"
                [disabled]="i === 0"
                title="Nach oben"
                aria-label="Nach oben verschieben"
                (click)="moveUp(i)"
              >
                <kq-icon name="arrow-up" [size]="16"/>
              </button>
              <button
                type="button"
                class="icon-btn"
                [disabled]="i === challenges.length - 1"
                title="Nach unten"
                aria-label="Nach unten verschieben"
                (click)="moveDown(i)"
              >
                <kq-icon name="arrow-down" [size]="16"/>
              </button>
            </div>
          </div>
        }
      </div>
    }

    <!-- FAB: Edit-Modus umschalten -->
    <button
      type="button"
      class="fab"
      [class.fab--active]="editMode()"
      [title]="editMode() ? 'Bearbeitungsmodus beenden' : 'Board bearbeiten'"
      [attr.aria-label]="editMode() ? 'Bearbeitungsmodus beenden' : 'Board bearbeiten'"
      (click)="toggleEditMode()"
    >
      <kq-icon [name]="editMode() ? 'x' : 'edit'" [size]="22"/>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    /* ── Kompakt-Liste (read-only) ── */
    .compact-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .compact-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #fff;
      border: 1px solid #d8cec2;
      border-radius: 6px;
      padding: 0.4rem 0.55rem;
      box-shadow: 0 1px 3px rgba(60, 30, 10, 0.08);
    }

    .compact-card__photo {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      background: #f2e8d8;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .compact-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .compact-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .compact-card__logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .compact-card__name {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      color: #3f2a1d;
      line-height: 1.25;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Edit-Liste ── */
    .edit-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .edit-card {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #fff;
      border: 1px solid #d8cec2;
      border-radius: 8px;
      padding: 0.5rem;
      box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1);
    }

    .edit-card__photo {
      position: relative;
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      background: #f2e8d8;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .edit-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-card__logo {
      width: 30px;
      height: 30px;
      object-fit: contain;
    }

    .edit-card__camera-hint {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(2px);
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7b3b22;
      border-top-left-radius: 4px;
    }

    .edit-card__body {
      flex: 1;
      overflow: hidden;
    }

    .edit-card__name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #3f2a1d;
      line-height: 1.3;
      display: block;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .edit-card__input {
      width: 100%;
      border: 1px solid #d0ab86;
      border-radius: 6px;
      padding: 0.3rem 0.45rem;
      background: #fffdf9;
      color: #3f2a1d;
      font-weight: 600;
      font-size: 0.88rem;
      box-sizing: border-box;
    }

    .edit-card__input:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.3);
      outline-offset: 1px;
    }

    .edit-card__actions {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex-shrink: 0;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      border: 1px solid #e0c8ac;
      border-radius: 6px;
      background: #fffaf4;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.15s;
    }

    .icon-btn:active {
      background: #ffe8cd;
    }

    .icon-btn--active {
      background: linear-gradient(135deg, #8f3b22 0%, #c46e35 100%);
      color: #fff7ec;
      border-color: transparent;
    }

    .icon-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* ── FAB ── */
    .fab {
      position: fixed;
      bottom: 1.5rem;
      right: 1.25rem;
      z-index: 100;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8f3b22 0%, #c46e35 100%);
      color: #fff7ec;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(96, 58, 30, 0.35);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .fab:active {
      transform: scale(0.94);
    }

    .fab--active {
      background: #5a2d1a;
    }
  `],
})
export class MobileEditableBoardComponent {
  private readonly el = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);

  private _challenges: Challenge[] = [];
  @Input() set challenges(value: Challenge[]) {
    this._challenges = value;
    void this.loadAllImages();
  }
  get challenges(): Challenge[] { return this._challenges; }

  @Output() challengeEdited = new EventEmitter<ChallengeEditedEvent>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();
  @Output() reorderRequested = new EventEmitter<ReorderRequestedEvent>();

  readonly editMode = signal(false);
  editingIndex: number | null = null;

  private readonly imageCache = new Map<string, string>();
  private readonly draftNames = new Map<number, string>();

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

  toggleEditMode(): void {
    if (this.editMode() && this.editingIndex !== null) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
    this.editMode.update(v => !v);
  }

  moveUp(i: number): void {
    if (i <= 0) return;
    this.reorderRequested.emit({ from: i, to: i - 1 });
  }

  moveDown(i: number): void {
    if (i >= this._challenges.length - 1) return;
    this.reorderRequested.emit({ from: i, to: i + 1 });
  }

  startEditing(i: number, challenge: Challenge, event: MouseEvent): void {
    event.stopPropagation();
    if (this.editingIndex === i) {
      this.saveAndExit(i, challenge);
      return;
    }
    if (this.editingIndex !== null) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
    this.editingIndex = i;
    this.draftNames.set(i, challenge.name);
  }

  cancelEditing(): void {
    this.editingIndex = null;
  }

  openDetail(i: number, challenge: Challenge, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, challenge });
  }

  getDraftName(i: number, fallback: string): string {
    return this.draftNames.get(i) ?? fallback;
  }

  onDraftNameInput(i: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draftNames.set(i, target.value);
  }

  saveAndExit(i: number, challenge: Challenge): void {
    const draftName = this.getDraftName(i, challenge.name).trim();
    const name = draftName.length > 0 ? draftName : challenge.name;
    const updated: Challenge = { name, imageId: challenge.imageId };
    if (updated.name !== challenge.name || updated.imageId !== challenge.imageId) {
      this.challengeEdited.emit({ index: i, challenge: updated });
    }
    this.editingIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.editingIndex === null) return;
    const target = event.target as Node;
    const cards = this.el.nativeElement.querySelectorAll('.edit-card');
    const editingCard = cards[this.editingIndex] as HTMLElement | undefined;
    if (editingCard && !editingCard.contains(target)) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
  }

  private async loadAllImages(): Promise<void> {
    const imageIds = this._challenges
      .map(c => c.imageId)
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
}
