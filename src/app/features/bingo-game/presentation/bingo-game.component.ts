import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BingoGameService } from '../application/bingo-game.service';
import { PlayableBoardComponent } from './components/playable-board.component';
import { ProjectComparisonDialogComponent } from './components/project-comparison-dialog.component';
import { ImageChangedEvent } from '../../board-configuration/presentation/components/card-detail-dialog.component';
import { Router } from '@angular/router';
import { ChallengeProgress } from '../domain/bingo-game';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [CommonModule, PlayableBoardComponent, ProjectComparisonDialogComponent, IconComponent],
  template: `
    <div class="feature-shell">
      <div class="toolbar">
        <button class="home-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
          <kq-icon name="home" [size]="22"/>
        </button>

        <div class="view-toggle" role="group" aria-label="Kartenansicht">
          <button
            class="mode-btn"
            [class.active]="viewMode === 'polaroid'"
            (click)="viewMode = 'polaroid'"
            title="Polaroid"
            aria-label="Polaroid-Ansicht"
          >
            <kq-icon name="polaroid" [size]="17"/>
          </button>
          <button
            class="mode-btn"
            [class.active]="viewMode === 'horizontal'"
            (click)="viewMode = 'horizontal'"
            title="Kompaktansicht – alles auf einen Blick"
            aria-label="Kompaktansicht"
          >
            <kq-icon name="horizontal" [size]="17"/>
          </button>
        </div>

        <div class="status-grid" aria-label="Fortschritt">
          <div
            *ngFor="let d of completed; let i = index"
            class="status-cell"
            [class.done]="d"
            [class.bingo]="isCellInBingo(i)"
            [attr.title]="challenges[i]?.name"
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
        [challenges]="challenges"
        [completed]="completed"
        [bingoCells]="bingoCells"
        [mode]="viewMode"
        (toggled)="onToggle($event)"
        (cardDetailOpened)="onCardDetailOpen($event)"
      ></app-playable-board>

      <app-project-comparison-dialog #comparisonDialog (imageChanged)="onImageChanged($event)"></app-project-comparison-dialog>
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
export class BingoGameComponent {
  @ViewChild('comparisonDialog') private readonly comparisonDialog!: ProjectComparisonDialogComponent;
  @ViewChild('playableBoard') private readonly playableBoardRef!: PlayableBoardComponent;
  state = inject(BingoGameService);
  router = inject(Router);

  viewMode: 'polaroid' | 'horizontal' = 'polaroid';

  get challenges(): ChallengeProgress[] {
    return this.state.challenges();
  }

  get completed(): boolean[] {
    return this.state.completed();
  }

  get bingoCells(): Set<number> {
    return this.state.bingoCells();
  }

  isCellInBingo(i: number): boolean {
    return this.state.bingoCells().has(i);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onToggle(i: number) {
    this.state.toggle(i);
  }

  onCardDetailOpen(event: { index: number; challenge: ChallengeProgress }) {
    this._openCardIndex = event.index;
    void this.comparisonDialog.open(
      event.challenge.name,
      event.challenge.planningImageId ?? null,
      event.challenge.progressImageId ?? null,
    );
  }

  onImageChanged(event: ImageChangedEvent): void {
    if (this._openCardIndex !== null) {
      this.state.updateProgressImage(this._openCardIndex, event.imageId ?? undefined);
    }
    void this.playableBoardRef.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;
}
