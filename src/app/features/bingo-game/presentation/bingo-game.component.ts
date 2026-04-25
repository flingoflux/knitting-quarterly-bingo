import { Component, ViewChild, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAY_BINGO_IN_PORT } from '../application/ports/in/play-bingo.in-port';
import { BingoGameDesktopComponent } from './bingo-game-desktop.component';
import { MobileBingoBoardComponent } from './components/mobile-bingo-board.component';
import { ProjectComparisonDialogComponent } from './components/project-comparison-dialog.component';
import { ImageChangedEvent } from '../../quarterly-plan/presentation/components/card-detail-dialog.component';
import { ChallengeProgress } from '../domain/bingo-game';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { QuarterClock, KnittingQuarterly } from '../../../core/domain';
import { BoardViewMode } from '../../user-settings/domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../user-settings/application/ports/in/manage-user-settings.in-port';
import { LayoutModeService } from '../../../shared/utils/layout-mode.service';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
const PAGE_TOOLBAR_WIDTH_HORIZONTAL = '58rem';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [CommonModule, BingoGameDesktopComponent, MobileBingoBoardComponent, ProjectComparisonDialogComponent, PageToolbarComponent, IconComponent, ButtonComponent, PageContainerComponent],
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

      @if (layoutMode.isMobile()) {
        <app-mobile-bingo-board
          #mobileBingoBoard
          [challenges]="challenges"
          [completed]="completed"
          [bingoCells]="bingoCells"
          (toggled)="onToggle($event)"
          (cardDetailOpened)="onCardDetailOpen($event)"
        />
      } @else {
        <app-bingo-game-desktop
          #desktopView
          [viewMode]="viewMode"
          (modeChanged)="onModeChange($event)"
          (printClicked)="onPrintClick()"
          (cardDetailOpened)="onCardDetailOpen($event)"
        />
      }

      <app-project-comparison-dialog #comparisonDialog (imageChanged)="onImageChanged($event)"></app-project-comparison-dialog>
    </kq-page-container>
  `,
  styles: [
    `
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

    @media (max-width: 640px) {
      kq-page-toolbar {
        justify-content: center;
      }
    }
  `]
})
export class BingoGameComponent implements OnInit {
  @ViewChild('comparisonDialog') private readonly comparisonDialog!: ProjectComparisonDialogComponent;
  @ViewChild('desktopView') private readonly desktopViewRef?: BingoGameDesktopComponent;
  @ViewChild('mobileBingoBoard') private readonly mobileBingoBoardRef?: MobileBingoBoardComponent;

  private readonly state = inject(PLAY_BINGO_IN_PORT);
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

  onPrintClick(): void {
    const urlTree = this.router.createUrlTree(['/quarterly-print'], {
      queryParams: {
        quarter: this.displayedQuarterId(),
        mode: this.viewMode,
      },
    });

    const printUrl = this.router.serializeUrl(urlTree);
    const absoluteUrl = new URL(printUrl.replace(/^\//, ''), document.baseURI).toString();
    const printWindow = window.open(absoluteUrl, '_blank');
    if (printWindow) {
      printWindow.opener = null;
    }
  }

  onToggle(i: number): void {
    this.state.persistToggledChallenge(i);
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
  }

  onCardDetailOpen(event: { index: number; challenge: ChallengeProgress }): void {
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
    void this.desktopViewRef?.refreshImage(event.imageId);
    void this.mobileBingoBoardRef?.refreshImage(event.imageId);
  }

  private _openCardIndex: number | null = null;
}
