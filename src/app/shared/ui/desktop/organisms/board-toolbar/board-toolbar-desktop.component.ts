import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../../common/atoms/button/button.component';
import { IconComponent } from '../../../common/atoms/icon/icon.component';

@Component({
  selector: 'kq-board-toolbar-desktop',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="toolbar-left">
      <kq-button
        *ngIf="showPrintButton"
        variant="icon"
        type="button"
        (click)="printClicked.emit()"
        title="Drucken"
        ariaLabel="Board drucken"
      >
        <kq-icon name="print" [size]="17"/>
      </kq-button>
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
  `]
})
export class BoardToolbarDesktopComponent {
  @Input() showPrintButton = false;
  @Output() printClicked = new EventEmitter<void>();

  @HostBinding('style.max-width')
  get hostMaxWidth(): string {
    return '52rem';
  }
}
