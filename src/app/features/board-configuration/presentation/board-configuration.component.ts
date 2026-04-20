import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardConfigurationService } from '../application/board-configuration.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { CardDetailDialogComponent, ImageChangedEvent } from './components/card-detail-dialog.component';
import { shuffleArray } from '../../../shared/utils/array-utils';
import { Challenge } from '../../../shared/domain/challenge';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';

@Component({
  selector: 'app-board-configuration',
  standalone: true,
  imports: [CommonModule, EditableBoardComponent, CardDetailDialogComponent, IconComponent, ButtonComponent, PageToolbarComponent],
  template: `
    <div class="feature-shell">
      <kq-page-toolbar [mode]="viewMode" (modeChange)="viewMode = $event" (homeClicked)="goHome()">
        <ng-container toolbar-actions>
          <kq-button variant="icon" (click)="shuffle()" title="Felder würfeln" ariaLabel="Felder würfeln">
            <kq-icon name="shuffle" [size]="22"/>
          </kq-button>
          <kq-button variant="icon" (click)="playBingo()" title="Als Bingo spielen" ariaLabel="Als Bingo spielen">
            <kq-icon name="play" [size]="22"/>
          </kq-button>
        </ng-container>
      </kq-page-toolbar>

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
      kq-page-toolbar {
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
