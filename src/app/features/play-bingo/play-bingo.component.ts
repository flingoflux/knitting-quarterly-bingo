import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayBingoStateService } from './state/play-bingo-state.service';
import { PlayableBoardComponent } from './components/playable-board.component';
import { CardDetailDialogComponent, ImageChangedEvent } from '../board-studio/components/card-detail-dialog.component';
import { Router } from '@angular/router';
import { BoardCell } from '../../shared/domain/board-cell';

@Component({
  selector: 'app-play-bingo-feature',
  standalone: true,
  imports: [CommonModule, PlayableBoardComponent, CardDetailDialogComponent],
  template: `
    <div class="feature-shell">
      <div class="toolbar">
        <button class="home-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7"/>
            <path d="M9 22V12h6v10"/>
            <path d="M21 22H3"/>
          </svg>
        </button>

        <div class="view-toggle" role="group" aria-label="Kartenansicht">
          <button
            class="mode-btn"
            [class.active]="viewMode === 'polaroid'"
            (click)="viewMode = 'polaroid'"
            title="Polaroid"
            aria-label="Polaroid-Ansicht"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="16" x2="21" y2="16"/>
            </svg>
          </button>
          <button
            class="mode-btn"
            [class.active]="viewMode === 'horizontal'"
            (click)="viewMode = 'horizontal'"
            title="Kompaktansicht – alles auf einen Blick"
            aria-label="Kompaktansicht"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="7" height="7" rx="1"/>
              <line x1="12" y1="6.5" x2="22" y2="6.5"/>
              <rect x="2" y="14" width="7" height="7" rx="1"/>
              <line x1="12" y1="17.5" x2="22" y2="17.5"/>
            </svg>
          </button>
        </div>

        <div class="status-grid" aria-label="Fortschritt">
          <div
            *ngFor="let d of done; let i = index"
            class="status-cell"
            [class.done]="d"
            [class.bingo]="isCellInBingo(i)"
            [attr.title]="projects[i]?.title"
          ></div>
        </div>
      </div>

      <div class="play-bingo-header" [class.compact-header]="viewMode === 'horizontal'">
        <p class="eyebrow">Knitting Quarterly - Bingo</p>
        <h2>Happy crafting</h2>
        <p class="subtitle" *ngIf="viewMode === 'polaroid'">Klicke auf die Felder, um erledigte Projekte abzuhaken und ein Bingo zu erreichen.</p>
      </div>

      <app-playable-board
        #playableBoard
        [projects]="projects"
        [done]="done"
        [bingoCells]="bingoCells"
        [mode]="viewMode"
        (toggled)="onToggle($event)"
        (cardDetailOpened)="onCardDetailOpen($event)"
      ></app-playable-board>

      <app-card-detail-dialog #detailDialog (imageChanged)="onImageChanged($event)"></app-card-detail-dialog>
    </div>
  `,
  styles: [
    `.feature-shell {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
    }
    .toolbar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.1rem;
    }
    .home-btn {
      background: #fff7ec;
      color: #7b371f;
      border: 1px solid #c79362;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 999px;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }
    .home-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .home-btn:hover {
      transform: translateY(-1px);
      background: #fff0db;
      box-shadow: 0 8px 14px rgba(96, 58, 30, 0.16);
    }
    .view-toggle {
      display: flex;
      height: 42px;
      border: 1px solid #c79362;
      border-radius: 999px;
      overflow: hidden;
    }
    .mode-btn {
      background: #fff7ec;
      color: #7b371f;
      border: none;
      cursor: pointer;
      width: 42px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, color 0.18s ease;
    }
    .mode-btn + .mode-btn {
      border-left: 1px solid #c79362;
    }
    .mode-btn:hover:not(.active) {
      background: #fff0db;
    }
    .mode-btn.active {
      background: linear-gradient(135deg, #8f3b22 0%, #c46e35 100%);
      color: #fff7ec;
    }
    .mode-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: -2px;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(4, 14px);
      grid-template-rows: repeat(4, 8px);
      gap: 3px;
      align-self: center;
      margin-left: 0.4rem;
    }
    .status-cell {
      width: 14px;
      height: 8px;
      border-radius: 2px;
      background: #fff;
      border: 1.5px solid #d0b08a;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .status-cell.done {
      background: #145906;
      border-color: #145906;
    }
    .status-cell.bingo {
      background: #145906;
      border-color: #145906;
    }
    .play-bingo-header {
      text-align: center;
      margin-bottom: 1.1rem;
      padding: 0.6rem 0.4rem;
    }
    .play-bingo-header.compact-header {
      padding: 0.2rem 0.4rem 0.4rem;
      margin-bottom: 0.5rem;
    }
    .eyebrow {
      margin: 0;
      color: #8f3b22;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 700;
    }
    h2 {
      margin: 0.4rem 0 0;
      font-size: clamp(1.6rem, 2.6vw, 2.2rem);
      color: #5a2d1a;
      text-wrap: balance;
    }
    .play-bingo-header .subtitle {
      color: #6c5445;
      font-size: 1.03rem;
      max-width: 44rem;
      margin: 0.55rem auto 0;
    }
    @media (max-width: 640px) {
      .feature-shell {
        padding: 1rem 0.75rem 1.4rem;
      }
      .toolbar {
        justify-content: center;
      }
    }
  `]
})
export class PlayBingoFeatureComponent {
  @ViewChild('detailDialog') private readonly detailDialog!: CardDetailDialogComponent;
  @ViewChild('playableBoard') private readonly playableBoardRef!: PlayableBoardComponent;
  state = inject(PlayBingoStateService);
  router = inject(Router);

  viewMode: 'polaroid' | 'horizontal' = 'polaroid';

  get projects(): BoardCell[] {
    return this.state.projects();
  }

  get done(): boolean[] {
    return this.state.done();
  }

  get bingoCells(): Set<number> {
    return this.state.bingoCells();
  }

  onToggle(i: number) {
    this.state.toggle(i);
  }

  onCardDetailOpen(event: { index: number; project: BoardCell }) {
    this._openCardIndex = event.index;
    this.detailDialog.open(event.project.imageId ?? null, event.project.title);
  }

  onImageChanged(event: ImageChangedEvent): void {
    if (this._openCardIndex !== null) {
      this.state.updateProjectImageId(this._openCardIndex, event.imageId ?? undefined);
    }
    void this.playableBoardRef.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;

  isCellInBingo(i: number): boolean {
    return this.bingoCells.has(i);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
