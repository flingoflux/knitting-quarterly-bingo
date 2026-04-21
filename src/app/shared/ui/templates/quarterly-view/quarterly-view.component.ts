import { Component, OnInit, computed, signal, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuarterClock } from '../../../../core/domain';
import { BingoGameComponent } from '../../../../features/bingo-game/presentation/bingo-game.component';
import { BoardConfigurationComponent } from '../../../../features/board-configuration/presentation/board-configuration.component';

/**
 * Zentrale View-Resolution für Knitting Quarterlies.
 * Entscheidet basierend auf quarterId automatisch zwischen Play- und Edit-View.
 * 
 * Logik:
 * - past quarter    → redirect /archive
 * - current quarter → BingoGameComponent (play)
 * - future quarter  → BoardConfigurationComponent (edit)
 */
@Component({
  selector: 'app-quarterly-view',
  standalone: true,
  imports: [BingoGameComponent, BoardConfigurationComponent],
  template: `
    @if (viewType() === 'play') {
      <app-bingo-game />
    } @else if (viewType() === 'edit') {
      <app-board-configuration />
    }
  `,
})
export class QuarterlyViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly quarterClock = new QuarterClock();

  readonly quarterId = signal<string>('');
  readonly currentQuarterId = this.quarterClock.getQuarterId(new Date());

  readonly viewType = computed(() => {
    const qId = this.quarterId();
    if (!qId) {
      return null;
    }

    const comparison = this.quarterClock.compareQuarterIds(qId, this.currentQuarterId);

    // Past quarter → redirect to archive
    if (comparison < 0) {
      console.log('[QuarterlyView] Past quarter detected, redirecting to archive:', qId);
      void this.router.navigate(['/archive']);
      return null;
    }

    // Current → play, Future → edit
    return comparison === 0 ? 'play' : 'edit';
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const qId = params.get('quarter');
        if (!qId) {
          // No quarter specified → use current
          console.log('[QuarterlyView] No quarter param, using current:', this.currentQuarterId);
          this.quarterId.set(this.currentQuarterId);
        } else {
          console.log('[QuarterlyView] Quarter param:', qId, '| viewType will be:', 
            this.quarterClock.compareQuarterIds(qId, this.currentQuarterId) === 0 ? 'play' : 'edit');
          this.quarterId.set(qId);
        }
      });
  }
}
