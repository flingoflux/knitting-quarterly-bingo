import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KnittingQuarterly, QuarterClock, type QuarterlyMode } from '../../../../core/domain';
import { BingoGameComponent } from '../../../bingo-game/presentation/bingo-game.component';
import { BoardConfigurationComponent } from '../../../board-configuration/presentation/board-configuration.component';
import { QuarterlyViewTemplateComponent } from '../../../../shared/ui/templates/quarterly-view/quarterly-view.component';

@Component({
  selector: 'app-quarterly-view-page',
  standalone: true,
  imports: [QuarterlyViewTemplateComponent, BingoGameComponent, BoardConfigurationComponent],
  template: `
    <kq-quarterly-view-template>
      @if (viewType() === 'play') {
        <app-bingo-game />
      } @else if (viewType() === 'edit') {
        <app-board-configuration />
      }
    </kq-quarterly-view-template>
  `,
})
export class QuarterlyViewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly quarterClock = new QuarterClock();

  private readonly resolvedQuarterId = signal<string | null>(null);
  private readonly currentQuarterId = this.quarterClock.getQuarterId(new Date());

  readonly viewType = computed<'play' | 'edit' | null>(() => {
    const quarterId = this.resolvedQuarterId();
    if (!quarterId) {
      return null;
    }

    const mode = this.modeForQuarter(quarterId);
    if (mode === 'archive') {
      return null;
    }

    return mode;
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const quarterId = params.get('quarter');
        if (!quarterId) {
          void this.router.navigate(['/quarterly'], {
            queryParams: {
              ...this.route.snapshot.queryParams,
              quarter: this.currentQuarterId,
            },
          });
          return;
        }

        if (this.modeForQuarter(quarterId) === 'archive') {
          void this.router.navigate(['/archive']);
          return;
        }

        this.resolvedQuarterId.set(quarterId);
      });
  }

  private modeForQuarter(quarterId: string): QuarterlyMode {
    const quarterly = KnittingQuarterly.create({
      quarterId,
      boardDefinitionId: quarterId,
      lifecycleState: 'play',
    });
    return quarterly.modeAt(this.currentQuarterId);
  }
}
