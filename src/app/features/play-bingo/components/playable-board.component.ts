import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCell } from '../../../shared/domain/board-cell';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../shared/ports/image-repository';

interface CardDetailOpenedEvent {
  index: number;
  project: BoardCell;
}

@Component({
  selector: 'app-playable-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid playable">
      <div
        *ngFor="let p of projects; let i = index"
        class="cell"
        [class.done]="done[i]"
        [class.bingo-cell]="isCellInBingo(i)"
        (click)="onToggle(i)"
      >
        <div class="photo-area">
          <img *ngIf="getImage(p.imageId)" [src]="getImage(p.imageId)" class="photo-img" [alt]="p.title" />
          <div *ngIf="!getImage(p.imageId)" class="photo-placeholder">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>

          <div *ngIf="done[i]" class="done-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <div *ngIf="isCellInBingo(i)" class="bingo-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
          <div class="title">{{p.title}}</div>
          <div class="cats">
            <span *ngFor="let key of p.catKeys" class="cat" [ngClass]="'cat-' + key">{{categoryLabels[key] ?? key}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid.playable {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.1rem;
      max-width: 70rem;
      margin: 1rem auto 0;
    }
    .cell {
      background: #fff;
      border-radius: 3px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 5px rgba(60, 30, 10, 0.14), 0 8px 20px rgba(60, 30, 10, 0.10);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .cell:hover {
      transform: translateY(-4px) rotate(0.4deg);
      box-shadow: 0 6px 14px rgba(60, 30, 10, 0.18), 0 16px 32px rgba(60, 30, 10, 0.13);
    }
    .cell.done .photo-area {
      filter: brightness(0.92);
    }
    .cell.bingo-cell {
      box-shadow: 0 0 0 3px #145906, 0 8px 22px rgba(20, 89, 6, 0.22);
    }
    .photo-area {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f2e8d8;
      overflow: hidden;
      flex-shrink: 0;
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
    .done-overlay {
      position: absolute;
      inset: 0;
      background: rgba(90, 150, 50, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .bingo-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #145906;
      color: #fff;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
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
      padding: 0.55rem 0.6rem 0.6rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      min-height: 78px;
      flex: 1;
    }
    .title {
      font-weight: 700;
      color: #4a2d1c;
      font-size: 0.82rem;
      line-height: 1.3;
      text-wrap: balance;
      text-align: center;
    }
    .cats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.22rem;
      justify-content: center;
      margin-top: auto;
    }
    .cat {
      font-size: 0.5rem;
      color: #fff;
      border-radius: 999px;
      border: none;
      background: #888;
      padding: 0.08rem 0.42rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .cat-basics { background: #ffa600; }
    .cat-technik { background: #1cb3f4; }
    .cat-challenge { background: #c44020; }
    .cat-accessoire { background: #5aaa2a; }
    @media (max-width: 960px) {
      .grid.playable {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 560px) {
      .grid.playable {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlayableBoardComponent {
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categoryLabels: Record<string, string> = {
    basics: 'Basics',
    technik: 'Technik',
    challenge: 'Challenge',
    accessoire: 'Accessoire',
  };

  private _projects: BoardCell[] = [];
  @Input() set projects(value: BoardCell[]) {
    this._projects = value;
    void this.loadAllImages();
  }
  get projects(): BoardCell[] { return this._projects; }

  @Input() done: boolean[] = [];
  @Input() bingoCells: Set<number> = new Set<number>();
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

  onToggle(i: number) {
    this.toggled.emit(i);
  }

  openDetail(i: number, project: BoardCell, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, project });
  }

  isCellInBingo(i: number): boolean {
    return this.bingoCells.has(i);
  }
}
