import { Component, ViewChild, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAN_QUARTERLY_IN_PORT } from '../application/ports/in/plan-quarterly.in-port';
import { QuarterlyPlanDesktopComponent } from './desktop/quarterly-plan-desktop.component';
import { EditableBoardMobileComponent } from './mobile/editable-board-mobile.component';
import { CardDetailDialogComponent } from './common/card-detail-dialog.component';
import { Challenge } from '../../../shared/domain/challenge';
import { IconComponent } from '../../../shared/ui';
import { ButtonComponent } from '../../../shared/ui';
import { PageToolbarComponent } from '../../../shared/ui';
import { PageContainerComponent } from '../../../shared/ui';
import type { ImageChangedEvent } from '../../../shared/ui';
import { QuarterClock } from '../../../core/domain';
import { BoardViewMode } from '../../user-settings/domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../user-settings/application/ports/in/manage-user-settings.in-port';
import { LayoutModeService } from '../../../shared/utils/layout-mode.service';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
const PAGE_TOOLBAR_WIDTH_HORIZONTAL = '58rem';

@Component({
  selector: 'app-quarterly-plan',
  standalone: true,
  imports: [CommonModule, QuarterlyPlanDesktopComponent, EditableBoardMobileComponent, CardDetailDialogComponent, IconComponent, ButtonComponent, PageToolbarComponent, PageContainerComponent],
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

      @if (layoutMode.isMobile()) {
        <app-mobile-editable-board
          #mobileEditableBoard
          [challenges]="challenges"
          (challengeEdited)="onChallengeEdited($event)"
          (cardDetailOpened)="onCardDetailOpen($event)"
          (reorderRequested)="onReorderRequested($event)"
        />
      } @else {
        <app-quarterly-plan-desktop
          #desktopView
          [viewMode]="viewMode"
          [quarterId]="displayedQuarterId()"
          (modeChanged)="onModeChange($event)"
          (cardDetailOpened)="onCardDetailOpen($event)"
          (bingoStarted)="onBingoStarted()"
        />
      }

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
  @ViewChild('desktopView') private readonly desktopViewRef?: QuarterlyPlanDesktopComponent;
  @ViewChild('mobileEditableBoard') private readonly mobileEditableBoardRef?: EditableBoardMobileComponent;

  private readonly state = inject(PLAN_QUARTERLY_IN_PORT);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);
  private readonly destroyRef = inject(DestroyRef);
  readonly layoutMode = inject(LayoutModeService);

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

  goHome(): void {
    void this.router.navigate(['/']);
  }

  goToHelp(): void {
    void this.router.navigate(['/how-it-works']);
  }

  goToNextQuarter(): void {
    const nextQuarter = this.quarterClock.getNextQuarterIdFromQuarterId(this.displayedQuarterId());
    void this.router.navigate(['/quarterly'], { queryParams: { quarter: nextQuarter } });
  }

  goToPreviousQuarter(): void {
    const previousQuarter = this.quarterClock.getPreviousQuarterIdFromQuarterId(this.displayedQuarterId());
    void this.router.navigate(['/quarterly'], { queryParams: { quarter: previousQuarter } });
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
  }

  onBingoStarted(): void {
    void this.router.navigate(['/quarterly'], { queryParams: { quarter: this.actualCurrentQuarterId } });
  }

  onChallengeEdited(event: { index: number; challenge: Challenge }): void {
    this.state.persistUpdatedChallenge(event.index, event.challenge);
  }

  onCardDetailOpen(event: { index: number; challenge: Challenge }): void {
    this._openCardIndex = event.index;
    this.detailDialog.open(event.challenge.imageId ?? null, event.challenge.name);
  }

  onImageChanged(event: ImageChangedEvent): void {
    if (this._openCardIndex === null) return;
    const challenge = this.state.challenges()[this._openCardIndex];
    if (challenge && challenge.imageId !== event.imageId) {
      this.state.persistUpdatedChallenge(this._openCardIndex, { ...challenge, imageId: event.imageId ?? undefined });
    }
    void this.desktopViewRef?.refreshImage(event.imageId);
    void this.mobileEditableBoardRef?.refreshImage(event.imageId);
  }

  onReorderRequested(event: { from: number; to: number }): void {
    this.state.persistSwappedChallenges(event.from, event.to);
  }

  private _openCardIndex: number | null = null;
}
