import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeProgress } from '../../domain/bingo-game';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';

interface CardDetailOpenedEvent {
  index: number;
  challenge: ChallengeProgress;
}

@Component({
  selector: 'app-mobile-bingo-board',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Read-only Grid (4×4 Miniatur-Polaroids) -->
    @if (!editMode()) {
      <div class="mini-grid">
        @for (p of challenges; track p.name; let i = $index) {
          <div
            class="mini-card"
            [class.mini-card--done]="completed[i]"
            [class.mini-card--bingo]="isCellInBingo(i)"
          >
            <div class="mini-card__photo">
              <img *ngIf="getImage(p.progressImageId ?? p.planningImageId)" [src]="getImage(p.progressImageId ?? p.planningImageId)" [alt]="p.name" class="mini-card__img" draggable="false" />
              <div *ngIf="!getImage(p.progressImageId ?? p.planningImageId)" class="mini-card__placeholder">
                <img src="assets/crown.svg" alt="" class="mini-card__logo" draggable="false" />
              </div>
              <div *ngIf="completed[i]" class="mini-card__done-badge">✓</div>
            </div>
            <div class="mini-card__label">{{ p.name }}</div>
          </div>
        }
      </div>
    }

    <!-- Edit-Liste (eine Karte pro Zeile) -->
    @if (editMode()) {
      <div class="edit-list">
        @for (p of challenges; track p.name; let i = $index) {
          <div
            class="edit-card"
            [class.edit-card--done]="completed[i]"
            [class.edit-card--bingo]="isCellInBingo(i)"
            (click)="onToggle(i)"
          >
            <div class="edit-card__photo">
              <img *ngIf="getImage(p.progressImageId ?? p.planningImageId)" [src]="getImage(p.progressImageId ?? p.planningImageId)" [alt]="p.name" class="edit-card__img" draggable="false" />
              <div *ngIf="!getImage(p.progressImageId ?? p.planningImageId)" class="edit-card__placeholder">
                <img src="assets/crown.svg" alt="" class="edit-card__logo" draggable="false" />
              </div>
              <div *ngIf="completed[i]" class="edit-card__done-badge"><kq-icon name="x-done" [size]="14" [strokeWidth]="2.2"/></div>
              <div *ngIf="isCellInBingo(i) && !completed[i]" class="edit-card__bingo-badge">★</div>
            </div>
            <div class="edit-card__body">
              <span class="edit-card__name">{{ p.name }}</span>
              <span class="edit-card__hint" *ngIf="completed[i]">Abgehakt</span>
              <span class="edit-card__hint" *ngIf="!completed[i]">Tippen zum Abhaken</span>
            </div>
            <button
              type="button"
              class="edit-card__camera"
              title="Foto ansehen / hochladen"
              aria-label="Foto ansehen oder hochladen"
              (click)="openDetail(i, p, $event)"
            >
              <kq-icon name="camera" [size]="18"/>
            </button>
          </div>
        }
      </div>
    }

    <!-- FAB: Edit-Modus umschalten -->
    <button
      type="button"
      class="fab"
      [class.fab--active]="editMode()"
      [title]="editMode() ? 'Bearbeitungsmodus beenden' : 'Felder abhaken'"
      [attr.aria-label]="editMode() ? 'Bearbeitungsmodus beenden' : 'Felder abhaken'"
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

    /* ── Mini-Grid (read-only) ── */
    .mini-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.4rem;
      margin: 0 auto;
    }

    .mini-card {
      background: #fff;
      border-radius: 3px;
      padding: 4px 4px 0;
      border: 1px solid #d8cec2;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(60, 30, 10, 0.1);
    }

    .mini-card--bingo {
      box-shadow: 0 0 0 2px #145906;
    }

    .mini-card--done .mini-card__photo {
      opacity: 0.7;
    }

    .mini-card__photo {
      position: relative;
      background: #f2e8d8;
      aspect-ratio: 1 / 1;
      border-radius: 2px;
      overflow: hidden;
    }

    .mini-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .mini-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mini-card__logo {
      width: 40%;
      max-width: 28px;
      height: auto;
      object-fit: contain;
    }

    .mini-card__done-badge {
      position: absolute;
      top: 2px;
      left: 2px;
      background: rgba(255,255,255,0.85);
      border-radius: 50%;
      width: 14px;
      height: 14px;
      font-size: 9px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7a1010;
      line-height: 1;
    }

    .mini-card__label {
      font-size: 0.52rem;
      font-weight: 700;
      color: #4a2d1c;
      text-align: center;
      padding: 0.2rem 0.1rem 0.25rem;
      line-height: 1.2;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Edit-Liste ── */
    .edit-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .edit-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fff;
      border: 1px solid #d8cec2;
      border-radius: 8px;
      padding: 0.5rem;
      box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1);
      cursor: pointer;
      transition: background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-card:active {
      background: #fff7ec;
    }

    .edit-card--done {
      background: #f8f4ef;
      opacity: 0.85;
    }

    .edit-card--bingo {
      border-color: #145906;
      box-shadow: 0 0 0 2px #14590633;
    }

    .edit-card__photo {
      position: relative;
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      background: #f2e8d8;
      border-radius: 6px;
      overflow: hidden;
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
      width: 36px;
      height: 36px;
      object-fit: contain;
    }

    .edit-card__done-badge {
      position: absolute;
      top: 3px;
      left: 3px;
      background: #fffef8;
      border: 1px solid #c9b49a;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7a1010;
    }

    .edit-card__bingo-badge {
      position: absolute;
      top: 3px;
      right: 3px;
      background: #b8860b;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 11px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      overflow: hidden;
    }

    .edit-card__name {
      font-weight: 700;
      font-size: 0.9rem;
      color: #3f2a1d;
      line-height: 1.25;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .edit-card__hint {
      font-size: 0.72rem;
      color: #9c7a64;
    }

    .edit-card__camera {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border: 1px solid #d8cec2;
      border-radius: 50%;
      background: #fff7ec;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-card__camera:active {
      background: #ffe8cd;
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
export class MobileBingoBoardComponent {
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);
  private readonly cdr = inject(ChangeDetectorRef);

  private _challenges: ChallengeProgress[] = [];
  @Input() set challenges(value: ChallengeProgress[]) {
    this._challenges = value;
    void this.loadAllImages();
  }
  get challenges(): ChallengeProgress[] { return this._challenges; }

  @Input() completed: boolean[] = [];
  @Input() bingoCells: Set<number> = new Set<number>();

  @Output() toggled = new EventEmitter<number>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();

  readonly editMode = signal(false);

  private readonly imageCache = new Map<string, string>();

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

  isCellInBingo(i: number): boolean {
    return this.bingoCells.has(i);
  }

  toggleEditMode(): void {
    this.editMode.update(v => !v);
  }

  onToggle(i: number): void {
    this.toggled.emit(i);
  }

  openDetail(i: number, challenge: ChallengeProgress, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, challenge });
  }

  private async loadAllImages(): Promise<void> {
    const imageIds = this._challenges
      .flatMap(c => [c.progressImageId, c.planningImageId])
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
