import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'kq-page-toolbar',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    <kq-button variant="icon" (click)="homeClicked.emit()" title="Zur Startseite" ariaLabel="Zur Startseite">
      <kq-icon name="home" [size]="22"/>
    </kq-button>

    <div class="quarter-nav">
      <kq-button
        variant="icon"
        [disabled]="!canGoToPreviousQuarter"
        (click)="previousQuarterClicked.emit()"
        title="Vorheriges Quartal"
        ariaLabel="Vorheriges Quartal"
      >
        <kq-icon name="chevron-left" [size]="20"/>
      </kq-button>
      <span class="quarter-label">{{ quarterLabel }}</span>
      <kq-button
        variant="icon"
        [disabled]="!canGoToNextQuarter"
        (click)="nextQuarterClicked.emit()"
        title="Naechstes Quartal"
        ariaLabel="Naechstes Quartal"
      >
        <kq-icon name="chevron-right" [size]="20"/>
      </kq-button>
    </div>

    <ng-content />

    <div class="toolbar-end">
      <ng-content select="[toolbar-actions]" />
      <div class="view-toggle" role="group" aria-label="Kartenansicht">
        <button
          class="mode-btn"
          type="button"
          [class.active]="mode === 'polaroid'"
          (click)="modeChange.emit('polaroid')"
          title="Polaroid"
          aria-label="Polaroid-Ansicht"
        >
          <kq-icon name="polaroid" [size]="17"/>
        </button>
        <button
          class="mode-btn"
          type="button"
          [class.active]="mode === 'horizontal'"
          (click)="modeChange.emit('horizontal')"
          title="Kompaktansicht – alles auf einen Blick"
          aria-label="Kompaktansicht"
        >
          <kq-icon name="horizontal" [size]="17"/>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
      flex-wrap: wrap;
    }
    .quarter-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      margin-left: 0.2rem;
    }
    .quarter-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 6.6rem;
      height: 42px;
      padding: 0 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--kq-outline, #c79362);
      background: #fff7ec;
      color: #7b371f;
      font-size: 0.84rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .toolbar-end {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-left: auto;
    }
    .view-toggle {
      display: flex;
      height: 42px;
      border: 1px solid var(--kq-outline, #c79362);
      border-radius: 999px;
      overflow: hidden;
    }
    .mode-btn {
      background: #fff7ec;
      color: #7b371f;
      border: none;
      cursor: pointer;
      width: 42px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, color 0.18s ease;
    }
    .mode-btn + .mode-btn {
      border-left: 1px solid var(--kq-outline, #c79362);
    }
    .mode-btn:hover:not(.active) {
      background: #fff0db;
    }
    .mode-btn.active {
      background: linear-gradient(135deg, #8f3b22 0%, #c46e35 100%);
      color: #fff7ec;
    }
    .mode-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: -2px;
    }
  `]
})
export class PageToolbarComponent {
  @Input() mode: 'polaroid' | 'horizontal' = 'polaroid';
  @Input() quarterLabel: string | null = null;
  @Input() canGoToPreviousQuarter = false;
  @Input() canGoToNextQuarter = false;
  @Output() modeChange = new EventEmitter<'polaroid' | 'horizontal'>();
  @Output() homeClicked = new EventEmitter<void>();
  @Output() previousQuarterClicked = new EventEmitter<void>();
  @Output() nextQuarterClicked = new EventEmitter<void>();
}
