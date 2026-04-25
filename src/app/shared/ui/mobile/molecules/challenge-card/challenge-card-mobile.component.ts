import { Component, Input } from '@angular/core';
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
      <div class="mini-card__photo">
        <kq-card-photo [imageUrl]="imageUrl" [alt]="name">
          <kq-badge *ngIf="done" variant="done" [compact]="true"/>
          <kq-badge *ngIf="inBingo && !done" variant="bingo" [compact]="true"/>
        </kq-card-photo>
      </div>
      <div class="mini-card__label">{{ name }}</div>
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
      padding: 4px 4px 0;
      border: 1px solid var(--kq-card-border-soft);
      display: flex;
      flex-direction: column;
      height: 100%;
      --kq-card-title-lines: var(--kq-card-title-lines-mobile, 3);
      box-shadow: 0 1px 3px rgba(60, 30, 10, 0.1);
    }

    .mini-card--bingo {
      box-shadow: 0 0 0 2px var(--kq-done);
    }

    .mini-card__photo {
      position: relative;
      background: var(--kq-photo-bg);
      aspect-ratio: 1 / 1;
      border-radius: 2px;
      overflow: hidden;
    }

    .mini-card__label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--kq-text-warm);
      text-align: center;
      padding: 0.2rem 0.1rem 0.3rem;
      line-height: 1.2;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--kq-card-title-lines, 3);
    }
  `],
})
export class ChallengeCardMobileComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() done = false;
  @Input() inBingo = false;
}
