import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export type KqBadgeVariant = 'done' | 'bingo';

/**
 * Badge-Overlay für Bingo-Karten.
 * 'done' = grüner Haken (oben links)
 * 'bingo' = goldener Stern (oben rechts)
 */
@Component({
  selector: 'kq-badge',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="badge"
      [class.badge--done]="variant === 'done'"
      [class.badge--bingo]="variant === 'bingo'"
    >
      <kq-icon
        *ngIf="variant === 'done'"
        name="check"
        [size]="iconSize"
        [strokeWidth]="3"
      />
      <kq-icon
        *ngIf="variant === 'bingo'"
        name="star"
        [size]="iconSize + 2"
      />
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .badge {
      position: absolute;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #145906;
      color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .badge--done {
      top: 6px;
      left: 6px;
      width: 22px;
      height: 22px;
    }
    .badge--bingo {
      top: 6px;
      right: 6px;
      width: 26px;
      height: 26px;
    }

    /* Kompaktmodus: kleiner */
    :host(.compact) .badge--done {
      width: 18px;
      height: 18px;
      top: 4px;
      left: 4px;
    }
    :host(.compact) .badge--bingo {
      width: 20px;
      height: 20px;
      top: 4px;
      right: 4px;
    }
  `],
})
export class BadgeComponent {
  @Input({ required: true }) variant!: KqBadgeVariant;

  @Input() set compact(value: boolean) {
    this._compact = value;
  }

  @HostBinding('class.compact')
  _compact = false;

  get iconSize(): number {
    return this._compact ? 10 : 12;
  }
}
