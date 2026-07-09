import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PlayPlanMode = 'play' | 'plan';

@Component({
  selector: 'kq-play-plan-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="play-plan-toggle" role="group" aria-label="Spielen oder Planen">
      <button
        type="button"
        class="mode-option mode-option--left"
        [class.active]="activeMode() === 'play'"
        (click)="onModeChange('play')"
      >
        Spielen
      </button>
      <button
        type="button"
        class="mode-option mode-option--right"
        [class.active]="activeMode() === 'plan'"
        (click)="onModeChange('plan')"
      >
        Planen
      </button>
    </div>
  `,
  styles: [`
    .play-plan-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: min(24rem, 100%);
      border: 1px solid #be7759;
      border-radius: 999px;
      overflow: hidden;
      background: var(--kq-bg-warm);
    }

    .mode-option {
      border: 0;
      background: transparent;
      color: var(--kq-primary-dark);
      font: inherit;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 0.92rem 1rem;
      cursor: pointer;
      transition: background 0.18s ease, color 0.18s ease;
    }

    .mode-option--left {
      border-right: 1px solid #d7a38b;
      background: var(--kq-bg-warm);
    }

    .mode-option--left.active {
      background: linear-gradient(135deg, var(--kq-primary-2) 0%, #9f4b27 100%);
      color: var(--kq-bg-warm);
    }

    .mode-option--right {
      background: var(--kq-bg-warm);
    }

    .mode-option--right.active {
      background: linear-gradient(135deg, var(--kq-primary-2) 0%, #9f4b27 100%);
      color: var(--kq-bg-warm);
    }

    .mode-option:hover {
      background: var(--kq-bg-tint);
      color: #6a2d18;
    }

    .mode-option.active:hover {
      background: linear-gradient(135deg, #b15f2a 0%, #8b3f1f 100%);
      color: var(--kq-bg-warm);
    }

    .mode-option:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.35);
      outline-offset: -3px;
    }
  `],
})
export class PlayPlanToggleComponent {
  activeMode = input<PlayPlanMode>('play');
  modeChanged = output<PlayPlanMode>();

  onModeChange(mode: PlayPlanMode): void {
    if (mode !== this.activeMode()) {
      this.modeChanged.emit(mode);
    }
  }
}
