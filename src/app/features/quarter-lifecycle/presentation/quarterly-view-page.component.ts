import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QuarterClock } from '../../../core/domain';
import { BingoGameComponent } from '../../bingo-game/presentation/bingo-game.component';
import { QuarterlyPlanComponent } from '../../quarterly-plan/presentation/quarterly-plan.component';
import { QuarterlyViewTemplateComponent } from '../../../shared/ui';

export type ViewMode = 'play' | 'plan';

@Component({
  selector: 'app-quarterly-view-page',
  standalone: true,
  imports: [QuarterlyViewTemplateComponent, BingoGameComponent, QuarterlyPlanComponent],
  template: `
    <kq-quarterly-view-template>
      @if (viewMode() === 'play') {
        <app-bingo-game (modeChanged)="onModeChanged($event)" />
      } @else if (viewMode() === 'plan') {
        <app-quarterly-plan (modeChanged)="onModeChanged($event)" />
      }
    </kq-quarterly-view-template>
  `,
})
export class QuarterlyViewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly viewMode = signal<ViewMode>('play');

  constructor() {
    // Determine view mode from route path
    effect(() => {
      const url = this.route.url;
      url.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(segments => {
        if (segments.length > 0 && segments[0].path === 'plan') {
          this.viewMode.set('plan');
        } else {
          this.viewMode.set('play');
        }
      });
    });
  }

  onModeChanged(mode: ViewMode): void {
    void this.router.navigate([`/${mode}`]);
  }
}
