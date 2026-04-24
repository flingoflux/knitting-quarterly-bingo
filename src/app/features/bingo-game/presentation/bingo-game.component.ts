import { Component, ViewChild, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAY_BINGO_IN_PORT } from '../application/ports/in/play-bingo.in-port';
import { PlayableBoardComponent } from './components/playable-board.component';
import { ProjectComparisonDialogComponent } from './components/project-comparison-dialog.component';
import { ImageChangedEvent } from '../../quarterly-plan/presentation/components/card-detail-dialog.component';
import { ChallengeProgress } from '../domain/bingo-game';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { BoardToolbarComponent } from '../../../shared/ui/organisms/board-toolbar/board-toolbar.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { QuarterClock, KnittingQuarterly } from '../../../core/domain';
import { BoardViewMode } from '../../user-settings/domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../user-settings/application/ports/in/manage-user-settings.in-port';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
const PAGE_TOOLBAR_WIDTH_HORIZONTAL = '58rem';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [CommonModule, PlayableBoardComponent, ProjectComparisonDialogComponent, PageToolbarComponent, BoardToolbarComponent, IconComponent, ButtonComponent, PageContainerComponent],
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

      <div class="preview-banner" *ngIf="isPreviewMode()">
        💡 Du schaust dir das <strong>{{ displayedQuarterId() }}</strong> an. Fortschritt wird hier nicht gespeichert.
      </div>

      <div class="play-bingo-header" [class.compact-header]="viewMode === 'kompakt'">
        <p class="eyebrow">Knitting Quarterly - Bingo</p>
        <h2 data-testid="page-bingo-title">Happy crafting</h2>
        <p class="subtitle">Klicke auf die Felder, um erledigte Projekte abzuhaken und ein Bingo zu erreichen.</p>
      </div>

      <kq-board-toolbar
        [mode]="viewMode"
        [showPrintButton]="true"
        (modeChange)="onModeChange($event)"
        (printClicked)="onPrintClick()"
      >
        <div class="status-grid" aria-label="Fortschritt">
          <div
            *ngFor="let d of completed; let i = index"
            class="status-cell"
            [class.done]="d"
            [class.bingo]="isCellInBingo(i)"
            [attr.title]="challenges[i]?.name"
          ></div>
        </div>
      </kq-board-toolbar>

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
    </kq-page-container>
  `,
  styles: [
    `
    .feature-shell {
      max-width: none;
      width: 100%;
      margin: 0;
      padding: 1.4rem 1.1rem 2rem;
    }
    .preview-banner {
      background: #fff7ec;
      border: 1px solid #c79362;
      border-radius: 0.5rem;
      padding: 0.9rem 1.1rem;
      margin-bottom: 1.1rem;
      color: #5a2d1a;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(4, 14px);
      grid-template-rows: repeat(4, 8px);
      gap: 3px;
      margin: 0;
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
      kq-page-toolbar {
        justify-content: center;
      }
    }
  `]
})
export class BingoGameComponent implements OnInit {
  @ViewChild('comparisonDialog') private readonly comparisonDialog!: ProjectComparisonDialogComponent;
  @ViewChild('playableBoard') private readonly playableBoardRef!: PlayableBoardComponent;
  state = inject(PLAY_BINGO_IN_PORT);
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
  readonly quarterly = computed(() =>
    KnittingQuarterly.create({
      quarterId: this.displayedQuarterId(),
    })
  );
  readonly isPreviewMode = computed(() => this.quarterly().isFuturePreview(this.actualCurrentQuarterId));
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
        if (quarterParam) {
          this.displayedQuarterId.set(quarterParam);
          this.state.setPreviewMode(this.quarterly().isFuturePreview(this.actualCurrentQuarterId), quarterParam);
        } else {
          this.displayedQuarterId.set(this.actualCurrentQuarterId);
          this.state.setPreviewMode(false);
        }
      });
  }

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

  onPrintClick(): void {
    const urlTree = this.router.createUrlTree(['/quarterly-print'], {
      queryParams: {
        quarter: this.displayedQuarterId(),
        mode: this.viewMode,
      },
    });

    const printUrl = this.router.serializeUrl(urlTree);
    const absoluteUrl = new URL(printUrl, window.location.href).toString();
    const printWindow = window.open(absoluteUrl, '_blank');
    if (printWindow) {
      printWindow.opener = null;
    }
  }

  onToggle(i: number) {
    this.state.persistToggledChallenge(i);
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
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
      this.state.persistProgressImage(this._openCardIndex, event.imageId ?? undefined);
    }
    void this.playableBoardRef.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;
}
