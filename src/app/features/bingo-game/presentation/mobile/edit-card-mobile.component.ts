import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/ui';
import { IconComponent } from '../../../../shared/ui';
import { CardPhotoComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-mobile-edit-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, IconComponent, CardPhotoComponent],
  template: `
    <div
      class="edit-card"
      [class.edit-card--done]="done"
      [class.edit-card--bingo]="inBingo"
      (click)="toggled.emit()"
    >
      <div class="edit-card__photo">
        <kq-card-photo [imageUrl]="imageUrl" [alt]="name">
          <kq-badge *ngIf="done" variant="done"/>
          <kq-badge *ngIf="inBingo && !done" variant="bingo"/>
          <button
            type="button"
            class="edit-card__camera-hint"
            title="Foto ansehen / hochladen"
            aria-label="Foto ansehen oder hochladen"
            (click)="onCameraClick($event)"
          >
            <kq-icon name="camera" [size]="16"/>
          </button>
        </kq-card-photo>
      </div>
      <div class="edit-card__body">
        <span class="edit-card__name">{{ name }}</span>
        <span class="edit-card__hint" *ngIf="done">Erledigt</span>
        <span class="edit-card__hint" *ngIf="!done">Tippen zum Abhaken</span>
      </div>
    </div>
  `,
  styles: [`
    .edit-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fff;
      border: 1px solid var(--kq-card-border-soft);
      border-radius: 8px;
      padding: 0.6rem;
      min-height: 8rem;
      box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1);
      cursor: pointer;
      transition: background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-card:active {
      background: var(--kq-bg-warm);
    }

    .edit-card--done {
      background: #f8f4ef;
      opacity: 0.85;
    }

    .edit-card--bingo {
      border-color: var(--kq-done);
      box-shadow: 0 0 0 2px var(--kq-done)33;
    }

    .edit-card__photo {
      position: relative;
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      background: var(--kq-photo-bg);
      border-radius: 6px;
      overflow: hidden;
      --kq-card-photo-logo-size: 40px;
      --kq-card-photo-logo-max-size: 40px;
    }

    .edit-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      overflow: hidden;
    }

    .edit-card__name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--kq-text);
      line-height: 1.3;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .edit-card__hint {
      font-size: 0.85rem;
      color: #9c7a64;
    }

    .edit-card__camera-hint {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(2px);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--kq-primary-dark);
      border-top-left-radius: 4px;
      border: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      padding: 0;
    }
  `],
})
export class EditCardMobileComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() done = false;
  @Input() inBingo = false;

  @Output() toggled = new EventEmitter<void>();
  @Output() cameraClicked = new EventEmitter<MouseEvent>();

  onCameraClick(event: MouseEvent): void {
    event.stopPropagation();
    this.cameraClicked.emit(event);
  }
}
