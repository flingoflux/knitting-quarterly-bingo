import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Atom: Einheitlicher Foto-Block mit Crown-Placeholder und Overlay-Slot.
 * Wird in Desktop-, Mobile- und Print-Karten-Komponenten verwendet.
 *
 * Logo-Größe steuerbar per CSS Custom Properties:
 *   --kq-card-photo-logo-size       (default: 40%)
 *   --kq-card-photo-logo-max-size   (default: 28px)
 *
 * Overlays (Badges, Kamera-Button) per <ng-content> projizieren.
 */
@Component({
  selector: 'kq-card-photo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img *ngIf="imageUrl" [src]="imageUrl" [alt]="alt" class="card-photo__img" draggable="false" />
    <div *ngIf="!imageUrl" class="card-photo__placeholder">
      <img src="assets/crown.svg" alt="" class="card-photo__logo" draggable="false" />
    </div>
    <ng-content />
  `,
  styles: [`
    :host {
      display: contents;
    }

    .card-photo__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      -webkit-user-drag: none;
      user-select: none;
    }

    .card-photo__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-photo__logo {
      width: var(--kq-card-photo-logo-size, 40%);
      max-width: var(--kq-card-photo-logo-max-size, 28px);
      height: auto;
      object-fit: contain;
    }
  `],
})
export class CardPhotoComponent {
  @Input({ required: true }) alt!: string;
  @Input() imageUrl: string | null = null;
}
