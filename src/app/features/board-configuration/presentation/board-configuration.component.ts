import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardConfigurationService } from '../application/board-configuration.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { CardDetailDialogComponent, ImageChangedEvent } from './components/card-detail-dialog.component';
import { shuffleArray } from '../../../shared/utils/array-utils';
import { Challenge } from '../../../shared/domain/challenge';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';

@Component({
  selector: 'app-board-configuration',
  standalone: true,
  imports: [CommonModule, EditableBoardComponent, CardDetailDialogComponent, IconComponent],
  template: `
    <div class="feature-shell">
      <div class="button-bar">
        <button class="icon-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
          <kq-icon name="home" [size]="22"/>
        </button>
        <button class="icon-btn" (click)="shuffle()" title="Felder würfeln" aria-label="Felder würfeln">
          <kq-icon name="shuffle" [size]="22"/>
        </button>
        <button class="icon-btn" (click)="playBingo()" title="Als Bingo spielen" aria-label="Als Bingo spielen">
          <kq-icon name="play" [size]="22"/>
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
            title="Kompaktansicht"
            aria-label="Kompaktansicht"
          >
            <kq-icon name="horizontal" [size]="17"/>
          </button>
        </div>
      </div>

      <div class="edit-board-header" [class.compact-header]="viewMode === 'horizontal'">
        <p class="eyebrow">Knitting Quarterly - Board Studio</p>
        <h2>Challenges und Projekte planen</h2>
        <p class="subtitle" *ngIf="viewMode === 'polaroid'">Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden.</p>
      </div>

      <app-editable-board
        #editableBoard
        [challenges]="challenges"
        [dragTargetIndex]="dragTargetIndex"
        [mode]="viewMode"
        (dragStarted)="onDragStart($event)"
        (dragOverCell)="onDragOver($event)"
        (dragLeftCell)="onDragLeave($event)"
        (droppedOnCell)="onDrop($event)"
        (challengeEdited)="onChallengeEdited($event)"
        (cardDetailOpened)="onCardDetailOpen($event)"
      ></app-editable-board>

      <app-card-detail-dialog #detailDialog (imageChanged)="onImageChanged($event)"></app-card-detail-dialog>
    </div>
  `,
  styles: [`
    .feature-shell {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
    }
    .button-bar {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
    }
    .icon-btn {
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
    .icon-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .icon-btn:hover {
      transform: translateY(-1px);
      background: #fff0db;
      box-shadow: 0 8px 14px rgba(96, 58, 30, 0.16);
    }
    .view-toggle {
      display: flex;
      border: 1px solid #c79362;
      border-radius: 999px;
      overflow: hidden;
      margin-left: 0.3rem;
    }
    .mode-btn {
      background: #fff7ec;
      color: #7b371f;
      border: none;
      cursor: pointer;
      width: 42px;
      height: 42px;
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
    .edit-board-header {
      text-align: center;
      margin-bottom: 1.1rem;
      padding: 0.6rem 0.4rem;
    }
    .edit-board-header.compact-header {
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
    .edit-board-header .subtitle {
      color: #6c5445;
      font-size: 1.03rem;
      max-width: 44rem;
      margin: 0.55rem auto 0;
    }
    @media (max-width: 640px) {
      .feature-shell {
        padding: 1rem 0.75rem 1.4rem;
      }
      .button-bar {
        justify-content: center;
      }
    }
  `],
})
export class BoardConfigurationComponent {
  @ViewChild('detailDialog') private readonly detailDialog!: CardDetailDialogComponent;
  @ViewChild('editableBoard') private readonly editableBoardRef!: EditableBoardComponent;
  state = inject(BoardConfigurationService);
  router = inject(Router);
  viewMode: 'polaroid' | 'horizontal' = 'polaroid';
  dragTargetIndex: number | null = null;
  dragStartIndex: number | null = null;

  get challenges(): Challenge[] {
    return this.state.challenges();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  shuffle() {
    const challenges = this.challenges;
    const shuffled = shuffleArray(challenges);
    this.state.setChallenges(shuffled as Challenge[]);
  }

  playBingo() {
    void this.router.navigate(['/play'], { queryParams: { new: 'true' } });
  }

  onDragStart(i: number) {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  }

  onDragOver(i: number) {
    if (this.dragStartIndex !== null) {
      this.dragTargetIndex = i;
    }
  }

  onDragLeave(_i: number) {
    this.dragTargetIndex = null;
  }

  onDrop(i: number) {
    if (this.dragStartIndex !== null && this.dragStartIndex !== i) {
      this.state.swapChallenges(this.dragStartIndex, i);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  }

  onChallengeEdited(event: { index: number; challenge: Challenge }) {
    this.state.updateChallenge(event.index, event.challenge);
  }

  onCardDetailOpen(event: { index: number; challenge: Challenge }) {
    this._openCardIndex = event.index;
    this.detailDialog.open(event.challenge.imageId ?? null, event.challenge.name);
  }

  onImageChanged(event: ImageChangedEvent): void {
    if (this._openCardIndex === null) return;
    const challenge = this.state.challenges()[this._openCardIndex];
    if (challenge && challenge.imageId !== event.imageId) {
      this.state.updateChallenge(this._openCardIndex, { ...challenge, imageId: event.imageId ?? undefined });
    }
    void this.editableBoardRef.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;
}
