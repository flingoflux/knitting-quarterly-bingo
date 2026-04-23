import { Component, Input } from '@angular/core';

export type KqButtonVariant = 'primary' | 'secondary' | 'icon' | 'ghost';
export type KqButtonSize = 'regular' | 'sm';

/**
 * Allgemeiner Button-Baustein.
 * Variant 'icon': runder Button ohne Text (42×42px), für Toolbar-Aktionen.
 * Variant 'primary' / 'secondary': große Text-Buttons für die Startseite.
 * Variant 'ghost': transparenter Button mit Rahmen (z.B. für Löschen).
 */
@Component({
  selector: 'kq-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [title]="title ?? ''"
      [attr.aria-label]="ariaLabel ?? title ?? null"
      [attr.data-testid]="testId ?? null"
      [disabled]="disabled"
      [class]="buttonClasses"
    >
      <ng-content />
    </button>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .kq-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      cursor: pointer;
      font: inherit;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
    }
    .kq-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }
    .kq-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }

    /* Icon-Button: rund, 42×42 */
    .kq-btn--icon {
      background: #fff7ec;
      color: #7b371f;
      border: 1px solid var(--kq-outline);
      border-radius: var(--kq-radius-full);
      width: 42px;
      height: 42px;
      padding: 0;
      flex-shrink: 0;
    }
    .kq-btn--icon:hover {
      transform: translateY(-1px);
      background: #fff0db;
      box-shadow: 0 8px 14px rgba(96, 58, 30, 0.16);
    }
    .kq-btn--icon-sm {
      width: 32px;
      height: 32px;
    }

    /* Primary */
    .kq-btn--primary {
      background: linear-gradient(135deg, var(--kq-primary) 0%, var(--kq-primary-2) 100%);
      color: var(--kq-bg-soft);
      border: 1px solid var(--kq-primary);
      border-radius: var(--kq-radius-full);
      padding: 0.95rem 1.8rem;
      font-size: var(--kq-font-size-base);
      font-weight: var(--kq-font-weight-bold);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      min-width: 16rem;
    }
    .kq-btn--primary:hover {
      transform: translateY(-1px);
      box-shadow: var(--kq-shadow);
    }

    /* Secondary */
    .kq-btn--secondary {
      background: var(--kq-bg-soft);
      color: var(--kq-text);
      border: 1px solid var(--kq-outline);
      border-radius: var(--kq-radius-full);
      padding: 0.95rem 1.8rem;
      font-size: var(--kq-font-size-base);
      font-weight: var(--kq-font-weight-bold);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      min-width: 16rem;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
    }
    .kq-btn--secondary:hover {
      transform: translateY(-1px);
      box-shadow: var(--kq-shadow);
    }

    /* Ghost */
    .kq-btn--ghost {
      background: transparent;
      color: #9b3a22;
      border: 1.5px solid #d9a088;
      border-radius: var(--kq-radius-full);
      padding: 0.45rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .kq-btn--ghost:hover {
      background: #fde8df;
      border-color: #c4614a;
      transform: translateY(-1px);
    }

    @media (max-width: 640px) {
      .kq-btn--primary,
      .kq-btn--secondary {
        width: 100%;
        min-width: 0;
      }
    }
  `],
})
export class ButtonComponent {
  @Input() variant: KqButtonVariant = 'primary';
  @Input() size: KqButtonSize = 'regular';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() title?: string;
  @Input() ariaLabel?: string;
  @Input() testId?: string;
  @Input() disabled = false;

  get buttonClasses(): string {
    const classes = ['kq-btn', `kq-btn--${this.variant}`];
    if (this.variant === 'icon' && this.size === 'sm') {
      classes.push('kq-btn--icon-sm');
    }
    return classes.join(' ');
  }
}
