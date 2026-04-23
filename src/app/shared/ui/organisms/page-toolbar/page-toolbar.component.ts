import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { QuarterNavComponent } from '../../molecules/quarter-nav/quarter-nav.component';

@Component({
  selector: 'kq-page-toolbar',
  standalone: true,
  imports: [IconComponent, ButtonComponent, QuarterNavComponent],
  template: `
    <div class="toolbar-left">
      <kq-button variant="icon" (click)="homeClicked.emit()" title="Zur Startseite" ariaLabel="Zur Startseite">
        <kq-icon name="home" [size]="20"/>
      </kq-button>
    </div>

    <div class="toolbar-center">
      @if (showQuarterNav) {
        <kq-quarter-nav
          [label]="quarterLabel"
          [canGoToPrevious]="canGoToPreviousQuarter"
          [showPreviousButton]="showPreviousButton"
          [showNextButton]="showNextButton"
          (previousClicked)="previousQuarterClicked.emit()"
          (nextClicked)="nextQuarterClicked.emit()"
        />
      }
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
  @Input() showQuarterNav = true;
  @Input() maxWidth = '52rem';
  @Output() homeClicked = new EventEmitter<void>();
  @Output() previousQuarterClicked = new EventEmitter<void>();
  @Output() nextQuarterClicked = new EventEmitter<void>();

  @HostBinding('style.max-width')
  get hostMaxWidth(): string {
    return this.maxWidth;
  }
}
