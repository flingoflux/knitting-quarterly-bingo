import { Component, ViewChild, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuarterlyPlanService } from '../application/quarterly-plan.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { CardDetailDialogComponent, ImageChangedEvent } from './components/card-detail-dialog.component';
import { shuffleArray } from '../../../shared/utils/array-utils';
import { Challenge } from '../../../shared/domain/challenge';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { BoardToolbarComponent } from '../../../shared/ui/organisms/board-toolbar/board-toolbar.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { QuarterClock } from '../../../core/domain';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
const PAGE_TOOLBAR_WIDTH_HORIZONTAL = '58rem';

@Component({
  selector: 'app-quarterly-plan',
  standalone: true,
  imports: [CommonModule, EditableBoardComponent, CardDetailDialogComponent, IconComponent, ButtonComponent, PageToolbarComponent, BoardToolbarComponent, PageContainerComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        [maxWidth]="viewMode === 'horizontal' ? PAGE_TOOLBAR_WIDTH_HORIZONTAL : PAGE_TOOLBAR_WIDTH_MOBILE"
        [quarterLabel]="displayedQuarterId()"
        [canGoToPreviousQuarter]="canGoToPreviousQuarter()"
        [showNextButton]="canGoToNextQuarter()"
        (homeClicked)="goHome()"
        (previousQuarterClicked)="goToPreviousQuarter()"
        (nextQuarterClicked)="goToNextQuarter()"
      >
        <kq-button toolbar-actions variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <div class="edit-board-header" [class.compact-header]="viewMode === 'horizontal'">
        <p class="eyebrow">Knitting Quarterly - Board Studio</p>
        <h2>Challenges und Projekte planen</h2>
        <p class="subtitle" *ngIf="viewMode === 'polaroid'">Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden.</p>
      </div>

      <kq-board-toolbar
        [mode]="viewMode"
        (modeChange)="viewMode = $event"
      >
        <kq-button
          variant="icon"
          (click)="resetToDefaultBoard()"
          title="Board auf Standard-Challenges zurücksetzen und Bilder entfernen"
          ariaLabel="Board auf Standard-Challenges zurücksetzen"
        >
          <kq-icon name="plus-feather" [size]="18"/>
        </kq-button>
        <kq-button variant="icon" (click)="shuffle()" title="Felder würfeln" ariaLabel="Felder würfeln">
          <kq-icon name="shuffle" [size]="22"/>
        </kq-button>
      </kq-board-toolbar>

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
    </kq-page-container>
  `,
  styles: [`
    .feature-shell {
      max-width: none;
      width: 100%;
      margin: 0;
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
export class QuarterlyPlanComponent implements OnInit {
  @ViewChild('detailDialog') private readonly detailDialog!: CardDetailDialogComponent;
  @ViewChild('editableBoard') private readonly editableBoardRef!: EditableBoardComponent;
  state = inject(QuarterlyPlanService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly PAGE_TOOLBAR_WIDTH_MOBILE = PAGE_TOOLBAR_WIDTH_MOBILE;
  readonly PAGE_TOOLBAR_WIDTH_HORIZONTAL = PAGE_TOOLBAR_WIDTH_HORIZONTAL;

  viewMode: 'polaroid' | 'horizontal' = 'polaroid';
  private readonly quarterClock = new QuarterClock();
  readonly actualCurrentQuarterId = this.quarterClock.getQuarterId(new Date());
  readonly displayedQuarterId = signal(this.actualCurrentQuarterId);
  readonly canGoToNextQuarter = computed(() => {
    const nextQuarterId = this.quarterClock.getNextQuarterIdFromQuarterId(this.actualCurrentQuarterId);
    return this.displayedQuarterId() !== nextQuarterId;
  });
  readonly canGoToPreviousQuarter = computed(() => true);
  dragTargetIndex: number | null = null;
  dragStartIndex: number | null = null;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        const quarterParam = queryParams.get('quarter');
        const planningQuarterId = quarterParam
          ?? this.quarterClock.getNextQuarterIdFromQuarterId(this.actualCurrentQuarterId);
        this.displayedQuarterId.set(planningQuarterId);
        this.state.setPreviewMode(false, planningQuarterId);
      });
  }

  get challenges(): Challenge[] {
    return this.state.challenges();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goToHelp() {
    this.router.navigate(['/how-it-works']);
  }

  goToNextQuarter() {
    const nextQuarter = this.quarterClock.getNextQuarterIdFromQuarterId(this.displayedQuarterId());
    void this.router.navigate(['/quarterly'], { queryParams: { quarter: nextQuarter } });
  }

  goToPreviousQuarter() {
    const previousQuarter = this.quarterClock.getPreviousQuarterIdFromQuarterId(this.displayedQuarterId());
    void this.router.navigate(['/quarterly'], { queryParams: { quarter: previousQuarter } });
  }

  shuffle() {
    const challenges = this.challenges;
    const shuffled = shuffleArray(challenges);
    this.state.setChallenges(shuffled as Challenge[]);
  }

  resetToDefaultBoard() {
    this.state.resetToDefaultChallengesWithoutImages();
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
