import { Component, ViewChild, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAN_QUARTERLY_IN_PORT } from '../application/ports/in/plan-quarterly.in-port';
import { START_BINGO_FROM_PLAN_IN_PORT } from '../../bingo-game/application/ports/in/start-bingo-from-plan.in-port';
import { EditableBoardComponent } from './components/editable-board.component';
import { CardDetailDialogComponent, ImageChangedEvent } from './components/card-detail-dialog.component';
import { shuffleArray } from '../../../shared/utils/array-utils';
import { Challenge } from '../../../shared/domain/challenge';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { FeatureHeaderComponent } from '../../../shared/ui/molecules/feature-header/feature-header.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { BoardToolbarComponent } from '../../../shared/ui/organisms/board-toolbar/board-toolbar.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { QuarterClock } from '../../../core/domain';
import { BoardViewMode } from '../../user-settings/domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../user-settings/application/ports/in/manage-user-settings.in-port';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
const PAGE_TOOLBAR_WIDTH_HORIZONTAL = '58rem';

@Component({
  selector: 'app-quarterly-plan',
  standalone: true,
  imports: [CommonModule, EditableBoardComponent, CardDetailDialogComponent, IconComponent, ButtonComponent, FeatureHeaderComponent, PageToolbarComponent, BoardToolbarComponent, PageContainerComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        [maxWidth]="viewMode === 'kompakt' ? PAGE_TOOLBAR_WIDTH_HORIZONTAL : PAGE_TOOLBAR_WIDTH_MOBILE"
        [quarterLabel]="displayedQuarterId()"
        [canGoToPreviousQuarter]="canGoToPreviousQuarter()"
        [showNextButton]="canGoToNextQuarter()"
        (homeClicked)="goHome()"
        (previousQuarterClicked)="goToPreviousQuarter()"
        (nextQuarterClicked)="goToNextQuarter()"
      >
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <kq-feature-header
        eyebrow="Knitting Quarterly - Board Studio"
        title="Challenges und Projekte planen"
        titleTestId="page-quarterly-plan-title"
        [subtitle]="viewMode === 'polaroid' ? 'Hier kannst du dein pers\u00f6nliches Bingo-Board f\u00fcr das n\u00e4chste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden.' : undefined"
        [compact]="viewMode === 'kompakt'"
      />

      <kq-board-toolbar
        [mode]="viewMode"
        (modeChange)="onModeChange($event)"
      >
        <kq-button variant="icon" (click)="shuffle()" title="Felder würfeln" ariaLabel="Felder würfeln">
          <kq-icon name="shuffle" [size]="22"/>
        </kq-button>
        <kq-button variant="icon" (click)="startBingo()" title="Neues Bingo mit diesem Plan starten" ariaLabel="Neues Bingo mit diesem Plan starten">
          <kq-icon name="play" [size]="20"/>
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
    @media (max-width: 640px) {
      kq-page-toolbar {
        justify-content: center;
      }
    }
  `],
})
export class QuarterlyPlanComponent implements OnInit {
  @ViewChild('detailDialog') private readonly detailDialog!: CardDetailDialogComponent;
  @ViewChild('editableBoard') private readonly editableBoardRef!: EditableBoardComponent;
  state = inject(PLAN_QUARTERLY_IN_PORT);
  private readonly startBingoFromPlanService = inject(START_BINGO_FROM_PLAN_IN_PORT);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);
  private readonly destroyRef = inject(DestroyRef);

  readonly PAGE_TOOLBAR_WIDTH_MOBILE = PAGE_TOOLBAR_WIDTH_MOBILE;
  readonly PAGE_TOOLBAR_WIDTH_HORIZONTAL = PAGE_TOOLBAR_WIDTH_HORIZONTAL;

  viewMode: BoardViewMode = this.userSettings.loadBoardViewMode();
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

  goToSettings() {
    void this.router.navigate(['/how-it-works'], { fragment: 'settings' });
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
    this.state.persistChallenges(shuffled as Challenge[]);
  }

  resetToDefaultBoard() {
    this.state.persistDefaultChallengesWithoutImages();
  }

  startBingo() {
    const confirmed = window.confirm(
      `Dein Board startet automatisch mit dem ${this.displayedQuarterId()} 🧶\n\n` +
      `Möchtest du schon jetzt damit spielen? Das überschreibt das aktuelle Bingo – ` +
      `inklusive deinem Fortschritt und allen Fotos.`,
    );
    if (!confirmed) return;
    const started = this.startBingoFromPlanService.startBingoFromPlan(this.displayedQuarterId());
    if (started) {
      void this.router.navigate(['/quarterly'], { queryParams: { quarter: this.actualCurrentQuarterId } });
    }
  }

  onDragStart(i: number) {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
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
      this.state.persistSwappedChallenges(this.dragStartIndex, i);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  }

  onChallengeEdited(event: { index: number; challenge: Challenge }) {
    this.state.persistUpdatedChallenge(event.index, event.challenge);
  }

  onCardDetailOpen(event: { index: number; challenge: Challenge }) {
    this._openCardIndex = event.index;
    this.detailDialog.open(event.challenge.imageId ?? null, event.challenge.name);
  }

  onImageChanged(event: ImageChangedEvent): void {
    if (this._openCardIndex === null) return;
    const challenge = this.state.challenges()[this._openCardIndex];
    if (challenge && challenge.imageId !== event.imageId) {
      this.state.persistUpdatedChallenge(this._openCardIndex, { ...challenge, imageId: event.imageId ?? undefined });
    }
    void this.editableBoardRef.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;
}
