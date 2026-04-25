import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeProgress } from '../../domain/bingo-game';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { ChallengeCardDesktopComponent } from '../../../../shared/ui';
import { BoardGridDesktopComponent } from '../../../../shared/ui';

interface CardDetailOpenedEvent {
  index: number;
  challenge: ChallengeProgress;
}

@Component({
  selector: 'app-playable-board',
  standalone: true,
  imports: [CommonModule, ChallengeCardDesktopComponent, BoardGridDesktopComponent],
  template: `
    <kq-board-grid-desktop [mode]="mode">
      <kq-challenge-card
        *ngFor="let p of challenges; let i = index"
        [name]="p.name"
        [imageUrl]="getImage(p.progressImageId ?? p.planningImageId)"
        [mode]="mode"
        [done]="completed[i]"
        [inBingo]="isCellInBingo(i)"
        [hoverable]="false"
        [showCameraButton]="true"
        (click)="onToggle(i)"
        (cameraClicked)="openDetail(i, p, $event)"
      />
    </kq-board-grid-desktop>
  `
})
export class PlayableBoardComponent {
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
  @Input() mode: 'polaroid' | 'kompakt' = 'polaroid';
  @Output() toggled = new EventEmitter<number>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();

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

  onToggle(i: number) {
    this.toggled.emit(i);
  }

  openDetail(i: number, challenge: ChallengeProgress, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, challenge });
  }

  isCellInBingo(i: number): boolean {
    return this.bingoCells.has(i);
  }
}
