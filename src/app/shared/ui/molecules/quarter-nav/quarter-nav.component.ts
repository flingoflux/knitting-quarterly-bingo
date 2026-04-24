import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'kq-quarter-nav',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    @if (showPreviousButton) {
      <kq-button
        testId="action-toolbar-quarter-prev"
        variant="icon"
        size="sm"
        [disabled]="!canGoToPrevious"
        (click)="previousClicked.emit()"
        title="Vorheriges Quartal"
        ariaLabel="Vorheriges Quartal"
      >
        <kq-icon name="chevron-left" [size]="12"/>
      </kq-button>
    } @else {
      <span class="nav-placeholder" aria-hidden="true"></span>
    }

    <span class="quarter-label" data-testid="state-toolbar-quarter-label">{{ label }}</span>

    @if (showNextButton) {
      <kq-button
        testId="action-toolbar-quarter-next"
        variant="icon"
        size="sm"
        (click)="nextClicked.emit()"
        title="Nächstes Quartal"
        ariaLabel="Nächstes Quartal"
      >
        <kq-icon name="chevron-right" [size]="12"/>
      </kq-button>
    } @else {
      <span class="nav-placeholder" aria-hidden="true"></span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    :host kq-button {
      opacity: 0.75;
    }
    :host kq-button:hover {
      opacity: 1;
    }
    .nav-placeholder {
      width: 32px;
      height: 32px;
      visibility: hidden;
    }
    .quarter-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 7.4rem;
      height: 28px;
      padding: 0 0.7rem;
      border-radius: 999px;
      border: 1px solid rgba(199, 147, 98, 0.5);
      background: rgba(255, 247, 236, 0.6);
      color: #7b371f;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `],
})
export class QuarterNavComponent {
  @Input() label: string | null = null;
  @Input() canGoToPrevious = false;
  @Input() showPreviousButton = true;
  @Input() showNextButton = true;
  @Output() previousClicked = new EventEmitter<void>();
  @Output() nextClicked = new EventEmitter<void>();
}
