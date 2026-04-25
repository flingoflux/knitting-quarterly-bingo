import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';

/**
 * Organism: Wiederverwendbare Dialog-Shell.
 * Kapselt <dialog>-Element, Backdrop, Panel, Close-Button und optionalen Titel.
 * Feature-Dialoge stellen ihren Inhalt per <ng-content> bereit.
 *
 * Verwendung:
 *   <kq-dialog-shell [title]="title" maxWidth="min(92vw, 480px)" (closed)="onClosed()">
 *     <!-- feature-spezifischer Inhalt -->
 *   </kq-dialog-shell>
 *
 * API:
 *   shell.open()  — Dialog öffnen (programmatisch via @ViewChild)
 *   shell.close() — Dialog schließen (emittiert auch (closed))
 */
@Component({
  selector: 'kq-dialog-shell',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <dialog #dialogEl [style.maxWidth]="maxWidth" (click)="onBackdropClick($event)">
      <div class="panel">
        <button class="close-btn" type="button" (click)="close()" aria-label="Dialog schließen">
          <kq-icon name="close" [size]="18" [strokeWidth]="2.5"/>
        </button>
        <h3 class="card-title" *ngIf="title">{{ title }}</h3>
        <ng-content />
      </div>
    </dialog>
  `,
  styles: [`
    dialog {
      border: none;
      border-radius: 20px;
      padding: 0;
      background: transparent;
      width: 100%;
      box-shadow: var(--kq-shadow-dialog);
    }

    dialog::backdrop {
      background: rgba(40, 20, 8, 0.45);
      backdrop-filter: blur(2px);
    }

    .panel {
      background: var(--kq-card, #fffaf2);
      border-radius: 20px;
      padding: 2rem 1.6rem 1.6rem;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .close-btn {
      position: absolute;
      top: 0.9rem;
      right: 0.9rem;
      border: 1px solid var(--kq-card-border, var(--kq-card-border));
      border-radius: 50%;
      width: 32px;
      height: 32px;
      background: #fff4e6;
      color: var(--kq-primary, var(--kq-primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
    }

    .close-btn:hover {
      background: #ffe8cd;
      color: #532615;
    }

    .card-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--kq-text-heading, var(--kq-text-warm));
      text-align: center;
      padding-right: 2rem;
      text-wrap: balance;
    }

    @media (max-width: 480px) {
      .panel {
        padding: 1.6rem 1rem 1.2rem;
      }
    }
  `],
})
export class DialogShellComponent {
  @ViewChild('dialogEl') private readonly dialogEl!: ElementRef<HTMLDialogElement>;

  @Input() title = '';
  @Input() maxWidth = 'min(92vw, 480px)';
  @Output() closed = new EventEmitter<void>();

  open(): void {
    this.dialogEl.nativeElement.showModal();
  }

  close(): void {
    this.dialogEl.nativeElement.close();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogEl.nativeElement) {
      this.close();
    }
  }
}
