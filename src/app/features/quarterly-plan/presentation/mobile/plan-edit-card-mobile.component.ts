import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';

@Component({
  selector: 'app-plan-mobile-edit-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="edit-card">
      <div class="edit-card__photo" (click)="cameraClicked.emit($event)">
        <img *ngIf="imageUrl" [src]="imageUrl" [alt]="name" class="edit-card__img" draggable="false" />
        <div *ngIf="!imageUrl" class="edit-card__placeholder">
          <img src="assets/crown.svg" alt="" class="edit-card__logo" draggable="false" />
        </div>
        <div class="edit-card__camera-hint">
          <kq-icon name="camera" [size]="16"/>
        </div>
      </div>

      <div class="edit-card__body">
        @if (isEditing) {
          <input
            class="edit-card__input"
            [value]="draftName"
            (input)="onNameInput($event)"
            (keydown.enter)="editToggled.emit($event)"
            (keydown.escape)="editCancelled.emit()"
            placeholder="Projektname"
          />
        } @else {
          <span class="edit-card__name">{{ name }}</span>
        }
      </div>

      <div class="edit-card__actions">
        <button
          type="button"
          class="icon-btn"
          [class.icon-btn--active]="isEditing"
          title="Umbenennen"
          aria-label="Projekt umbenennen"
          (click)="editToggled.emit($event)"
        >
          <kq-icon [name]="isEditing ? 'check' : 'edit'" [size]="16"/>
        </button>
        <button
          type="button"
          class="icon-btn"
          [disabled]="isFirst"
          title="Nach oben"
          aria-label="Nach oben verschieben"
          (click)="movedUp.emit()"
        >
          <kq-icon name="arrow-up" [size]="16"/>
        </button>
        <button
          type="button"
          class="icon-btn"
          [disabled]="isLast"
          title="Nach unten"
          aria-label="Nach unten verschieben"
          (click)="movedDown.emit()"
        >
          <kq-icon name="arrow-down" [size]="16"/>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .edit-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fff;
      border: 1px solid #d8cec2;
      border-radius: 8px;
      padding: 0.6rem;
      min-height: 8rem;
      box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1);
    }

    .edit-card__photo {
      position: relative;
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      background: #f2e8d8;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .edit-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-card__logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }

    .edit-card__camera-hint {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(2px);
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7b3b22;
      border-top-left-radius: 4px;
    }

    .edit-card__body {
      flex: 1;
      overflow: hidden;
    }

    .edit-card__name {
      font-size: 1rem;
      font-weight: 600;
      color: #3f2a1d;
      line-height: 1.3;
      display: block;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .edit-card__input {
      width: 100%;
      border: 1px solid #d0ab86;
      border-radius: 6px;
      padding: 0.3rem 0.45rem;
      background: #fffdf9;
      color: #3f2a1d;
      font-weight: 600;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .edit-card__input:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.3);
      outline-offset: 1px;
    }

    .edit-card__actions {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex-shrink: 0;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      border: 1px solid #e0c8ac;
      border-radius: 6px;
      background: #fffaf4;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.15s;
    }

    .icon-btn:active {
      background: #ffe8cd;
    }

    .icon-btn--active {
      background: linear-gradient(135deg, #8f3b22 0%, #c46e35 100%);
      color: #fff7ec;
      border-color: transparent;
    }

    .icon-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  `],
})
export class PlanEditCardMobileComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() isEditing = false;
  @Input() draftName = '';
  @Input() isFirst = false;
  @Input() isLast = false;

  @Output() cameraClicked = new EventEmitter<MouseEvent>();
  @Output() editToggled = new EventEmitter<MouseEvent>();
  @Output() editCancelled = new EventEmitter<void>();
  @Output() movedUp = new EventEmitter<void>();
  @Output() movedDown = new EventEmitter<void>();
  @Output() nameInput = new EventEmitter<string>();

  onNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nameInput.emit(target.value);
  }
}
