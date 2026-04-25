import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../../common/atoms/icon/icon.component';

/**
 * Atom: Floating Action Button für Mobile-Ansichten.
 * Togglet zwischen Edit- und Read-only-Modus.
 */
@Component({
  selector: 'kq-fab-mobile',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="fab"
      [class.fab--active]="active"
      [title]="active ? activeLabel : inactiveLabel"
      [attr.aria-label]="active ? activeLabel : inactiveLabel"
      (click)="clicked.emit()"
    >
      <kq-icon [name]="active ? 'x' : 'edit'" [size]="22"/>
    </button>
  `,
  styles: [`
    .fab {
      position: fixed;
      bottom: 1.5rem;
      right: 1.25rem;
      z-index: 100;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--kq-primary) 0%, var(--kq-primary-2) 100%);
      color: var(--kq-bg-warm);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(96, 58, 30, 0.35);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .fab:active {
      transform: scale(0.94);
    }

    .fab--active {
      background: var(--kq-text-heading);
    }
  `],
})
export class MobileFabComponent {
  @Input() active = false;
  @Input() inactiveLabel = 'Bearbeiten';
  @Input() activeLabel = 'Bearbeitungsmodus beenden';

  @Output() clicked = new EventEmitter<void>();
}
