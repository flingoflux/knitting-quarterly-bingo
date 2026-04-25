import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KnittingQuarterly, QuarterClock, type QuarterlyPhase } from '../../../core/domain';
import { BingoGameComponent } from '../../bingo-game/presentation/bingo-game.component';
import { QuarterlyPlanComponent } from '../../quarterly-plan/presentation/quarterly-plan.component';
import { QuarterlyViewTemplateComponent } from '../../../shared/ui';

@Component({
  selector: 'app-quarterly-view-page',
  standalone: true,
  imports: [QuarterlyViewTemplateComponent, BingoGameComponent, QuarterlyPlanComponent],
  template: `
    <kq-quarterly-view-template>
      @if (viewType() === 'play') {
        <app-bingo-game />
      } @else if (viewType() === 'edit') {
        <app-quarterly-plan />
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

    const phase = this.phaseForQuarter(quarterId);
    if (phase === 'past') {
      return null;
    }

    return phase === 'future' ? 'edit' : 'play';
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

        if (this.phaseForQuarter(quarterId) === 'past') {
          void this.router.navigate(['/archive']);
          return;
        }

        this.resolvedQuarterId.set(quarterId);
      });
  }

  private phaseForQuarter(quarterId: string): QuarterlyPhase {
    const quarterly = KnittingQuarterly.create({
      quarterId,
    });
    return quarterly.phaseAt(this.currentQuarterId);
  }
}
