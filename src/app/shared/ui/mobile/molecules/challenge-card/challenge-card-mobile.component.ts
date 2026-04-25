import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../common/atoms/badge/badge.component';
import { CardPhotoComponent } from '../../../common/atoms/card-photo/card-photo.component';

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
        (click)="toggleFlip()"
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
          <span class="mini-card__label">{{ name }}</span>
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
      aspect-ratio: 1 / 1;
      display: block;
      position: relative;
      border: 0;
      padding: 0;
      background: transparent;
      border-radius: 2px;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 220ms ease;
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
      background: linear-gradient(180deg, #fff7ed 0%, #fff1df 100%);
      border: 1px dashed var(--kq-card-border-soft);
      transform: rotateY(180deg);
      padding: 0.35rem;
    }

    .mini-card__label {
      font-size: 0.6rem;
      font-weight: 700;
      color: var(--kq-text-warm);
      text-align: center;
      line-height: 1.1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--kq-card-title-lines, 3);
    }
  `],
})
export class ChallengeCardMobileComponent {
  readonly isFlipped = signal(false);

  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() done = false;
  @Input() inBingo = false;

  toggleFlip(): void {
    this.isFlipped.update(v => !v);
  }
}
