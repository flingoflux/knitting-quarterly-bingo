import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/ui/atoms/badge/badge.component';
import { CardPhotoComponent } from '../../../../shared/ui/atoms/card-photo/card-photo.component';

@Component({
  selector: 'app-mobile-mini-card',
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
    .mini-card {
      background: #fff;
      border-radius: 3px;
      padding: 4px 4px 0;
      border: 1px solid #d8cec2;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(60, 30, 10, 0.1);
    }

    .mini-card--bingo {
      box-shadow: 0 0 0 2px #145906;
    }

    .mini-card__photo {
      position: relative;
      background: #f2e8d8;
      aspect-ratio: 1 / 1;
      border-radius: 2px;
      overflow: hidden;
    }

    .mini-card__label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #4a2d1c;
      text-align: center;
      padding: 0.2rem 0.1rem 0.3rem;
      line-height: 1.2;
    }
  `],
})
export class MiniCardMobileComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() done = false;
  @Input() inBingo = false;
}
