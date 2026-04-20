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

    <ng-content />
  `,
  styles: [`
    :host {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
    }
    .view-toggle {
      display: flex;
      height: 42px;
      border: 1px solid var(--kq-outline, #c79362);
      border-radius: 999px;
      overflow: hidden;
      margin-left: 0.3rem;
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
  @Output() modeChange = new EventEmitter<'polaroid' | 'horizontal'>();
  @Output() homeClicked = new EventEmitter<void>();
}
