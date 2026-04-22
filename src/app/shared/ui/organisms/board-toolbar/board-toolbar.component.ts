import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'kq-board-toolbar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toolbar-left">
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

    <div class="toolbar-right">
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
      max-width: 52rem;
      margin-left: auto;
      margin-right: auto;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
export class BoardToolbarComponent {
  @Input() mode: 'polaroid' | 'horizontal' = 'polaroid';
  @Output() modeChange = new EventEmitter<'polaroid' | 'horizontal'>();

  @HostBinding('style.max-width')
  get hostMaxWidth(): string {
    return this.mode === 'horizontal' ? '58rem' : '52rem';
  }
}
