import { Component, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PLAN_QUARTERLY_IN_PORT } from '../application/ports/in/plan-quarterly.in-port';
import { START_BINGO_FROM_PLAN_IN_PORT } from '../../bingo-game/application/ports/in/start-bingo-from-plan.in-port';
import { QuarterlyPlanDesktopComponent } from './desktop/quarterly-plan-desktop.component';
import { EditableBoardMobileComponent } from './mobile/editable-board-mobile.component';
import { Challenge } from '../../../shared/domain/challenge';
import { IconComponent, ButtonComponent, PageToolbarComponent, PageContainerComponent, FeatureHeaderComponent, PlayPlanToggleComponent } from '../../../shared/ui';
import { QuarterClock } from '../../../core/domain';
import { LayoutModeService } from '../../../shared/utils/layout-mode.service';

const PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';

@Component({
  selector: 'app-quarterly-plan',
  standalone: true,
  imports: [CommonModule, QuarterlyPlanDesktopComponent, EditableBoardMobileComponent, IconComponent, ButtonComponent, PageToolbarComponent, PageContainerComponent, FeatureHeaderComponent, PlayPlanToggleComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar [maxWidth]="PAGE_TOOLBAR_WIDTH_MOBILE" (homeClicked)="goHome()">
        <kq-play-plan-toggle 
          activeMode="plan"
          (modeChanged)="onModeChanged($event)"
        ></kq-play-plan-toggle>
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      @if (layoutMode.isMobile()) {
        <kq-feature-header
          [eyebrow]="nextQuarterId"
          title="Challenges planen"
          titleTestId="page-quarterly-plan-title"
          [subtitle]="mobileSubtitle()"
        />

        <app-mobile-editable-board
          #mobileEditableBoard
          [challenges]="challenges"
          (challengeEdited)="onChallengeEdited($event)"
          (reorderRequested)="onReorderRequested($event)"
          (editModeChanged)="onMobileEditModeChanged($event)"
          (printRequested)="onPrintClick()"
          (bingoStarted)="onBingoStarted()"
        />
      } @else {
        <app-quarterly-plan-desktop
          #desktopView
          [quarterId]="nextQuarterId"
          (printRequested)="onPrintClick()"
          (bingoStarted)="onBingoStarted()"
        />
      }

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
export class QuarterlyPlanComponent {
  private readonly state = inject(PLAN_QUARTERLY_IN_PORT);
  private readonly startBingoFromPlanService = inject(START_BINGO_FROM_PLAN_IN_PORT);
  private readonly router = inject(Router);
  readonly layoutMode = inject(LayoutModeService);

  readonly PAGE_TOOLBAR_WIDTH_MOBILE = '52rem';
  private readonly quarterClock = new QuarterClock();
  readonly nextQuarterId = this.quarterClock.getNextQuarterId(new Date());
  readonly mobileEditMode = signal(false);
  readonly mobileSubtitle = computed(() =>
    this.mobileEditMode()
      ? EditableBoardMobileComponent.editSubtitle
      : EditableBoardMobileComponent.overviewSubtitle
  );

  modeChanged = output<'play' | 'plan'>();

  constructor() {
    this.state.setPreviewMode(false, this.nextQuarterId);
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

  onModeChanged(mode: 'play' | 'plan'): void {
    this.modeChanged.emit(mode);
  }

  onMobileEditModeChanged(isEditing: boolean): void {
    this.mobileEditMode.set(isEditing);
  }

  onBingoStarted(): void {
    const quarterId = this.nextQuarterId;
    const confirmed = window.confirm(
      `Dein Board startet automatisch mit dem ${quarterId} 🧶\n\n` +
      `Möchtest du schon jetzt damit spielen? Das überschreibt das aktuelle Bingo – ` +
      `inklusive deinem Fortschritt und allen Fotos.`,
    );
    if (!confirmed) return;
    const started = this.startBingoFromPlanService.startBingoFromPlan(quarterId);
    if (started) {
      void this.router.navigate(['/play']);
    }
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

  onChallengeEdited(event: { index: number; challenge: Challenge }): void {
    this.state.persistUpdatedChallenge(event.index, event.challenge);
  }

  onReorderRequested(event: { from: number; to: number }): void {
    this.state.persistSwappedChallenges(event.from, event.to);
  }
}
