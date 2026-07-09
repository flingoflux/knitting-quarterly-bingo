import { Component, ViewChild, inject, output, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PLAY_BINGO_IN_PORT } from '../application/ports/in/play-bingo.in-port';
import { BingoGameDesktopComponent } from './desktop/bingo-game-desktop.component';
import { BingoBoardMobileComponent } from './mobile/bingo-board-mobile.component';
import { ProjectComparisonDialogComponent } from './common/project-comparison-dialog.component';
import { ChallengeProgress } from '../domain/bingo-game';
import { IconComponent, ButtonComponent, PageToolbarComponent, PageContainerComponent, FeatureHeaderComponent, PlayPlanToggleComponent } from '../../../shared/ui';
import type { ImageChangedEvent } from '../../../shared/ui';
import { QuarterClock } from '../../../core/domain';
import { LayoutModeService } from '../../../shared/utils/layout-mode.service';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [CommonModule, BingoGameDesktopComponent, BingoBoardMobileComponent, ProjectComparisonDialogComponent, PageToolbarComponent, IconComponent, ButtonComponent, PageContainerComponent, FeatureHeaderComponent, PlayPlanToggleComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar [maxWidth]="PAGE_TOOLBAR_WIDTH_MOBILE" (homeClicked)="goHome()">
        <kq-play-plan-toggle 
          activeMode="play"
          (modeChanged)="onModeChanged($event)"
        ></kq-play-plan-toggle>
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      @if (layoutMode.isMobile()) {
        <kq-feature-header
          eyebrow="Bingo"
          title="Happy crafting"
          titleTestId="page-bingo-title"
          [subtitle]="mobileSubtitle()"
        />

        <app-mobile-bingo-board
          #mobileBingoBoard
          [challenges]="challenges"
          [completed]="completed"
          [bingoCells]="bingoCells"
          (toggled)="onToggle($event)"
          (cardDetailOpened)="onCardDetailOpen($event)"
          (editModeChanged)="onMobileEditModeChanged($event)"
          (printClicked)="onPrintClick()"
        />
      } @else {
        <app-bingo-game-desktop
          #desktopView
          (printClicked)="onPrintClick()"
          (cardDetailOpened)="onCardDetailOpen($event)"
        />
      }

      <app-project-comparison-dialog #comparisonDialog (imageChanged)="onImageChanged($event)"></app-project-comparison-dialog>
    </kq-page-container>
  `,
  styles: [
    `
    @media (max-width: 640px) {
      kq-page-toolbar {
        justify-content: center;
      }
    }
  `]
})
export class BingoGameComponent {
  @ViewChild('comparisonDialog') private readonly comparisonDialog!: ProjectComparisonDialogComponent;
  @ViewChild('desktopView') private readonly desktopViewRef?: BingoGameDesktopComponent;
  @ViewChild('mobileBingoBoard') private readonly mobileBingoBoardRef?: BingoBoardMobileComponent;

  private readonly state = inject(PLAY_BINGO_IN_PORT);
  private readonly router = inject(Router);
  readonly layoutMode = inject(LayoutModeService);

  readonly PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
  private readonly quarterClock = new QuarterClock();
  readonly actualCurrentQuarterId = this.quarterClock.getQuarterId(new Date());
  readonly mobileEditMode = signal(false);
  readonly mobileSubtitle = computed(() =>
    this.mobileEditMode()
      ? BingoBoardMobileComponent.editSubtitle
      : BingoBoardMobileComponent.overviewSubtitle
  );

  modeChanged = output<'play' | 'plan'>();

  constructor() {
    this.state.setPreviewMode(false);
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

  onModeChanged(mode: 'play' | 'plan'): void {
    this.modeChanged.emit(mode);
  }

  onPrintClick(): void {
    const urlTree = this.router.createUrlTree(['/quarterly-print'], {
      queryParams: {
        mode: 'polaroid',
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

  onMobileEditModeChanged(isEditing: boolean): void {
    this.mobileEditMode.set(isEditing);
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
