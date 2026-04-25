import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IconComponent } from '../../../common/atoms/icon/icon.component';

@Component({
  selector: 'kq-board-toolbar-desktop',
  standalone: true,
  imports: [CommonModule, IconComponent],
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
          [class.active]="mode === 'kompakt'"
          (click)="modeChange.emit('kompakt')"
          title="Kompaktansicht – alles auf einen Blick"
          aria-label="Kompaktansicht"
        >
          <kq-icon name="horizontal" [size]="17"/>
        </button>
      </div>
      <button
        *ngIf="showPrintButton"
        class="action-btn"
        type="button"
        (click)="printClicked.emit()"
        title="Drucken"
        aria-label="Board drucken"
      >
        <kq-icon name="print" [size]="17"/>
      </button>
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
      max-width: var(--kq-shell-max-width);
      margin-left: auto;
      margin-right: auto;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn {
      background: var(--kq-bg-warm);
      color: var(--kq-primary-dark);
      border: 1px solid var(--kq-outline, #c79362);
      border-radius: 999px;
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      background: var(--kq-bg-highlight);
      box-shadow: var(--kq-shadow-card);
    }

    .action-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }

    .view-toggle {
      display: flex;
      height: 42px;
      border: 1px solid var(--kq-outline, #c79362);
      border-radius: 999px;
      overflow: hidden;
    }

    .mode-btn {
      background: var(--kq-bg-warm);
      color: var(--kq-primary-dark);
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
      background: var(--kq-bg-highlight);
    }

    .mode-btn.active {
      background: linear-gradient(135deg, var(--kq-primary) 0%, var(--kq-primary-2) 100%);
      color: var(--kq-bg-warm);
    }

    .mode-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: -2px;
    }
  `]
})
export class BoardToolbarDesktopComponent {
  @Input() mode: 'polaroid' | 'kompakt' = 'polaroid';
  @Input() showPrintButton = false;
  @Output() modeChange = new EventEmitter<'polaroid' | 'kompakt'>();
  @Output() printClicked = new EventEmitter<void>();

  @HostBinding('style.max-width')
  get hostMaxWidth(): string {
    return this.mode === 'kompakt' ? '58rem' : '52rem';
  }
}
