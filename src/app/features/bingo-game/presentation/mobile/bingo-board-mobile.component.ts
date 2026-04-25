import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeProgress } from '../../domain/bingo-game';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';
import { MiniCardMobileComponent } from './mini-card-mobile.component';
import { EditCardMobileComponent } from './edit-card-mobile.component';

interface CardDetailOpenedEvent {
  index: number;
  challenge: ChallengeProgress;
}

@Component({
  selector: 'app-mobile-bingo-board',
  standalone: true,
  imports: [CommonModule, IconComponent, MiniCardMobileComponent, EditCardMobileComponent],
  template: `
    <!-- Read-only Grid (4×4 Miniatur-Polaroids) -->
    @if (!editMode()) {
      <div class="mini-grid">
        @for (p of challenges; track p.name; let i = $index) {
          <app-mobile-mini-card
            [name]="p.name"
            [imageUrl]="getImage(p.progressImageId ?? p.planningImageId)"
            [done]="completed[i]"
            [inBingo]="isCellInBingo(i)"
          />
        }
      </div>
    }

    <!-- Edit-Liste (eine Karte pro Zeile) -->
    @if (editMode()) {
      <div class="edit-list">
        @for (p of challenges; track p.name; let i = $index) {
          <app-mobile-edit-card
            [name]="p.name"
            [imageUrl]="getImage(p.progressImageId ?? p.planningImageId)"
            [done]="completed[i]"
            [inBingo]="isCellInBingo(i)"
            (toggled)="onToggle(i)"
            (cameraClicked)="openDetail(i, p, $event)"
          />
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

    .mini-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.4rem;
      margin: 0 auto;
    }

    .edit-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
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
export class BingoBoardMobileComponent {
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
