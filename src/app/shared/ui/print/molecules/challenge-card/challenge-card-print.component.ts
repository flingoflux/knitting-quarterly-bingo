import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KqCardMode } from '../../../desktop/molecules/challenge-card/challenge-card-desktop.component';
import { IconComponent } from '../../../common/atoms/icon/icon.component';
import { CardPhotoComponent } from '../../../common/atoms/card-photo/card-photo.component';

/**
 * Druckoptimierte Bingo-Karte.
 * Wird ausschließlich in PrintBingoBoardComponent verwendet.
 * Kein Hover, keine Kamera, keine Transitions – nur statisches Layout für A4-Druck.
 */
@Component({
  selector: 'kq-print-challenge-card',
  standalone: true,
  imports: [CommonModule, IconComponent, CardPhotoComponent],
  template: `
    <div
      class="card"
      [class.card--polaroid]="mode === 'polaroid'"
      [class.card--kompakt]="mode === 'kompakt'"
      [class.card--done]="done"
      [class.card--bingo]="inBingo"
    >
      <div class="card__photo">
        <kq-card-photo [imageUrl]="imageUrl" [alt]="name">
          <div *ngIf="done" class="card__badge card__badge--done">
            <kq-icon name="x-done" [size]="14" [strokeWidth]="2.2" />
          </div>
          <div *ngIf="inBingo && !done" class="card__badge card__badge--bingo">★</div>
          <div *ngIf="!done && !inBingo" class="card__badge card__badge--empty"></div>
        </kq-card-photo>
      </div>

      <div class="card__caption">
        <div class="card__title">{{ name }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .card {
      background: #fff;
      display: flex;
      flex-direction: column;
      break-inside: avoid;
    }

    /* ── Foto-Bereich ── */
    .card__photo {
      position: relative;
      background: var(--kq-photo-bg);
      overflow: hidden;
      flex-shrink: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      --kq-card-photo-logo-max-size: 48px;
    }
    /* ── Badge ── */
    .card__badge {
      position: absolute;
      top: 4px;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .card__badge--done {
      left: 4px;
      background: #fffef8;
      border: 0.35mm solid #c9b49a;
      color: #7a1010;
    }
    .card__badge--bingo {
      right: 4px;
      background: #b8860b;
      color: #fff;
    }
    .card__badge--empty {
      left: 4px;
      background: #fff;
      border: 0.3mm solid #c9b49a;
    }

    /* ── Caption ── */
    .card__caption {
      background: #fff;
    }
    .card__title {
      font-weight: 700;
      color: var(--kq-text-warm);
      line-height: 1.25;
      text-align: center;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Polaroid-Modus ── */
    .card--polaroid {
      padding: 5px 5px 0;
      border: 0.3mm solid var(--kq-card-border-soft);
      border-radius: 2px;
    }
    .card--polaroid .card__photo {
      width: 100%;
      aspect-ratio: 1 / 1;
    }
    .card--polaroid .card__caption {
      padding: 0.25rem 0.15rem 0.35rem;
      min-height: 2.2em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card--polaroid .card__title {
      font-size: 0.62rem;
    }

    /* ── Kompakt-Modus ── */
    .card--kompakt {
      flex-direction: row;
      align-items: stretch;
      border: 0.3mm solid var(--kq-card-border-soft);
      border-radius: 2px;
      height: 3.8rem;
    }
    .card--kompakt .card__photo {
      width: 3.8rem;
      height: 3.8rem;
      aspect-ratio: unset;
      flex-shrink: 0;
    }
    .card--kompakt .card__caption {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0.25rem 0.4rem;
      overflow: hidden;
    }
    .card--kompakt .card__title {
      font-size: 0.6rem;
      text-align: left;
    }
  `],
})
export class ChallengeCardPrintComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() mode: KqCardMode = 'polaroid';
  @Input() done = false;
  @Input() inBingo = false;
}
