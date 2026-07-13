import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, KqIconName } from '../../../common/atoms/icon/icon.component';

export interface FabGroupAction {
  icon: KqIconName;
  label: string;
  active?: boolean;
}

/**
 * Atom: Speed-Dial Floating Action Button für Mobile-Ansichten.
 * Ein Haupt-FAB öffnet eine Gruppe von Aktionsbuttons.
 * Wenn closeAction gesetzt ist, wird statt des Speed-Dials direkt ein
 * X-Button mit dem übergebenen Label angezeigt.
 */
@Component({
  selector: 'kq-fab-group-mobile',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (closeAction) {
      <!-- Nur X-Button: direkter Ausstieg aus einem aktiven Modus -->
      <div class="fab-group">
        <button
          type="button"
          class="fab fab-main fab-main--close"
          [attr.aria-label]="closeAction"
          [title]="closeAction"
          (click)="actionClicked.emit(-1)"
        >
          <kq-icon name="x" [size]="22"/>
        </button>
      </div>
    } @else {
      <div
        class="fab-backdrop"
        [class.fab-backdrop--visible]="isOpen()"
        (click)="isOpen.set(false)"
        aria-hidden="true"
      ></div>

      <div class="fab-group">
        <div class="fab-actions" [class.fab-actions--open]="isOpen()">
          @for (action of actions; track action.label; let i = $index) {
            <div class="fab-action-row">
              <span class="fab-action-label">{{ action.label }}</span>
              <button
                type="button"
                class="fab fab-action"
                [class.fab-action--active]="action.active"
                [attr.aria-label]="action.label"
                [title]="action.label"
                (click)="onActionClick(i)"
              >
                <kq-icon [name]="action.icon" [size]="20"/>
              </button>
            </div>
          }
        </div>

        <button
          type="button"
          class="fab fab-main"
          [attr.aria-label]="isOpen() ? 'Menü schließen' : 'Aktionen anzeigen'"
          [title]="isOpen() ? 'Schließen' : 'Aktionen'"
          (click)="toggleOpen()"
        >
          <kq-icon [name]="isOpen() ? 'x' : 'layers'" [size]="22"/>
        </button>
      </div>
    }
  `,
  styles: [`
    .fab-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
      background: rgba(44, 27, 17, 0.2);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .fab-backdrop--visible {
      opacity: 1;
      pointer-events: auto;
    }

    .fab-group {
      position: fixed;
      bottom: 1.5rem;
      right: 1.25rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .fab-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
      opacity: 0;
      pointer-events: none;
      transform: translateY(0.5rem);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .fab-actions--open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .fab-action-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .fab-action-label {
      background: rgba(255, 247, 237, 0.96);
      color: var(--kq-text-warm);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(60, 30, 10, 0.15);
      white-space: nowrap;
      pointer-events: none;
    }

    .fab {
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .fab:active {
      transform: scale(0.94);
    }

    .fab-main {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--kq-primary) 0%, var(--kq-primary-2) 100%);
      color: var(--kq-bg-warm);
      box-shadow: 0 4px 14px rgba(96, 58, 30, 0.35);
    }

    .fab-action {
      width: 46px;
      height: 46px;
      background: var(--kq-bg-warm, #fff7ed);
      color: var(--kq-primary);
      box-shadow: 0 2px 8px rgba(60, 30, 10, 0.2);
    }

    .fab-action--active {
      background: var(--kq-text-heading);
      color: var(--kq-bg-warm);
    }
    .fab-main--close {
      background: var(--kq-text-heading);
    }
  `],
})
export class FabGroupMobileComponent {
  readonly isOpen = signal(false);

  /** Wenn gesetzt: Speed-Dial wird ausgeblendet, stattdessen erscheint ein X-Button mit diesem Label. */
  @Input() closeAction: string | null = null;
  @Input() actions: FabGroupAction[] = [];
  @Output() actionClicked = new EventEmitter<number>();

  toggleOpen(): void {
    this.isOpen.set(!this.isOpen());
  }

  onActionClick(index: number): void {
    this.actionClicked.emit(index);
    this.isOpen.set(false);
  }
}
