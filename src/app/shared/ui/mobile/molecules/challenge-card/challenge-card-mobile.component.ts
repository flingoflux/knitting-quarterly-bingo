import { Component, EventEmitter, Input, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../common/atoms/badge/badge.component';
import { CardPhotoComponent } from '../../../common/atoms/card-photo/card-photo.component';

const LONG_PRESS_DURATION_MS = 450;

@Component({
  selector: 'kq-challenge-card-mobile',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CardPhotoComponent],
  template: `
    <div
      class="mini-card"
      [class.mini-card--done]="done"
      [class.mini-card--bingo]="inBingo"
    >
      <button
        type="button"
        class="mini-card__button"
        [class.mini-card__button--flipped]="isFlipped()"
        [attr.aria-label]="isFlipped() ? 'Karte umdrehen: Foto anzeigen' : 'Karte umdrehen: Titel anzeigen'"
        (click)="onCardClick()"
        (pointerdown)="onPressStart($event)"
        (pointerup)="onPressEnd()"
        (pointerleave)="onPressEnd()"
        (pointercancel)="onPressEnd()"
        (contextmenu)="onContextMenu($event)"
      >
        <span class="mini-card__face mini-card__face--front">
          <span class="mini-card__photo">
            <kq-card-photo [imageUrl]="imageUrl" [alt]="name">
              <kq-badge *ngIf="done" variant="done" [compact]="true"/>
              <kq-badge *ngIf="inBingo && !done" variant="bingo" [compact]="true"/>
            </kq-card-photo>
          </span>
        </span>
        <span class="mini-card__face mini-card__face--back">
          <span class="mini-card__back-badge" *ngIf="done">
            <kq-badge variant="done" [compact]="true"/>
          </span>
          <span class="mini-card__label" data-testid="card-title">{{ name }}</span>
        </span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .mini-card {
      background: #fff;
      border-radius: 3px;
      padding: 4px;
      border: 1px solid var(--kq-card-border-soft);
      height: 100%;
      --kq-card-title-lines: var(--kq-card-title-lines-mobile, 4);
      box-shadow: 0 1px 3px rgba(60, 30, 10, 0.1);
    }

    .mini-card--bingo {
      box-shadow: 0 0 0 2px var(--kq-done);
    }

    .mini-card__button {
      width: 100%;
      aspect-ratio: 0.92 / 1;
      display: block;
      position: relative;
      border: 0;
      padding: 0;
      background: transparent;
      border-radius: 2px;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 220ms ease;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }

    .mini-card__button--flipped {
      transform: rotateY(180deg);
    }

    .mini-card__button:focus-visible {
      outline: 2px solid var(--kq-done);
      outline-offset: 2px;
    }

    .mini-card__face {
      position: absolute;
      inset: 0;
      display: block;
      border-radius: 2px;
      overflow: hidden;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    .mini-card__photo {
      position: relative;
      background: var(--kq-photo-bg);
      width: 100%;
      height: 100%;
      display: block;
    }

    .mini-card__face--back {
      display: grid;
      place-items: center;
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, #fff7ed 0%, #fff1df 100%);
      border: 1px dashed var(--kq-card-border-soft);
      transform: rotateY(180deg);
      padding: 0.35rem;
    }

    .mini-card__back-badge {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }

    .mini-card__label {
      font-size: clamp(0.55rem, 1.8vw, 0.78rem);
      font-weight: 700;
      color: var(--kq-text-warm);
      text-align: center;
      line-height: 1.1;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--kq-card-title-lines, 3);
    }
  `],
})
export class ChallengeCardMobileComponent implements OnDestroy {
  readonly isFlipped = signal(false);

  @Input({ required: true }) name!: string;
  private _imageUrl: string | null = null;

  @Input() set imageUrl(value: string | null) {
    this._imageUrl = value;
    // Without a photo we start on the text side; with a photo we show the photo side.
    this.isFlipped.set(!value);
  }
  get imageUrl(): string | null {
    return this._imageUrl;
  }

  @Input() done = false;
  @Input() inBingo = false;

  @Output() longPressed = new EventEmitter<void>();

  private pressTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private suppressClickOnce = false;

  onCardClick(): void {
    if (this.suppressClickOnce) {
      this.suppressClickOnce = false;
      return;
    }
    this.toggleFlip();
  }

  onPressStart(event: PointerEvent): void {
    if (!event.isPrimary || event.button > 0) {
      return;
    }

    this.clearPressTimeout();
    this.pressTimeoutId = setTimeout(() => {
      this.suppressClickOnce = true;
      this.longPressed.emit();
      this.pressTimeoutId = null;
    }, LONG_PRESS_DURATION_MS);
  }

  onPressEnd(): void {
    this.clearPressTimeout();
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  toggleFlip(): void {
    this.isFlipped.update(v => !v);
  }

  ngOnDestroy(): void {
    this.clearPressTimeout();
  }

  private clearPressTimeout(): void {
    if (this.pressTimeoutId === null) {
      return;
    }
    clearTimeout(this.pressTimeoutId);
    this.pressTimeoutId = null;
  }
}
