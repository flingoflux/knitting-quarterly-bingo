import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'kq-page-toolbar',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    <div class="toolbar-left">
      <kq-button variant="icon" (click)="homeClicked.emit()" title="Zur Startseite" ariaLabel="Zur Startseite">
        <kq-icon name="home" [size]="20"/>
      </kq-button>
    </div>

    <div class="toolbar-center">
      <div class="quarter-nav">
        @if (showPreviousButton) {
          <kq-button
            variant="icon"
            size="sm"
            [disabled]="!canGoToPreviousQuarter"
            (click)="previousQuarterClicked.emit()"
            title="Vorheriges Quartal"
            ariaLabel="Vorheriges Quartal"
          >
            <kq-icon name="chevron-left" [size]="12"/>
          </kq-button>
        } @else {
          <span class="nav-placeholder" aria-hidden="true"></span>
        }
        <span class="quarter-label">{{ quarterLabel }}</span>
        @if (showNextButton) {
          <kq-button
            variant="icon"
            size="sm"
            (click)="nextQuarterClicked.emit()"
            title="Naechstes Quartal"
            ariaLabel="Naechstes Quartal"
          >
            <kq-icon name="chevron-right" [size]="12"/>
          </kq-button>
        } @else {
          <span class="nav-placeholder" aria-hidden="true"></span>
        }
      </div>
      <ng-content />
    </div>

    <div class="toolbar-end">
      <ng-content select="[toolbar-actions]" />
    </div>
  `,
  styles: [`
    :host {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
      max-width: 52rem;
      margin-left: auto;
      margin-right: auto;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .toolbar-left kq-button {
      opacity: 0.7;
    }
    .toolbar-left kq-button:hover {
      opacity: 1;
    }
    .toolbar-center {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      justify-content: center;
    }
    .quarter-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .quarter-nav kq-button {
      opacity: 0.75;
    }
    .quarter-nav kq-button:hover {
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
    .toolbar-end {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      justify-content: flex-end;
    }
    @media (max-width: 768px) {
      :host {
        grid-template-columns: 1fr;
        justify-items: center;
      }
      .toolbar-left,
      .toolbar-end {
        display: none;
      }
    }
  `]
})
export class PageToolbarComponent {
  @Input() quarterLabel: string | null = null;
  @Input() canGoToPreviousQuarter = false;
  @Input() showPreviousButton = true;
  @Input() showNextButton = true;
  @Input() maxWidth = '52rem';
  @Output() homeClicked = new EventEmitter<void>();
  @Output() previousQuarterClicked = new EventEmitter<void>();
  @Output() nextQuarterClicked = new EventEmitter<void>();

  @HostBinding('style.max-width')
  get hostMaxWidth(): string {
    return this.maxWidth;
  }
}
