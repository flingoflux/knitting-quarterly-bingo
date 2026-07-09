import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KqCardMode } from '../../../desktop/molecules/challenge-card/challenge-card-desktop.component';

/**
 * Druckoptimierte Bingo-Karte.
 * Wird ausschließlich in PrintBingoBoardComponent verwendet.
 * Kein Hover, keine Kamera, keine Transitions – nur statisches Layout für A4-Druck.
 */
@Component({
  selector: 'kq-print-challenge-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card card--polaroid"
      [class.card--done]="done"
      [class.card--bingo]="inBingo"
    >
      <div class="card__photo">
        <img *ngIf="imageUrl" [src]="imageUrl" [alt]="name" class="card__img" draggable="false" />
        <div *ngIf="!imageUrl" class="card__placeholder" aria-hidden="true"></div>
      </div>

      <div class="card__caption">
        <div class="card__title" data-testid="card-title">{{ name }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .card {
      background: #fff;
      display: flex;
      flex-direction: column;
      height: 100%;
      break-inside: avoid;
    }

    /* ── Foto-Bereich ── */
    .card__photo {
      position: relative;
      background: #fff;
      overflow: hidden;
      flex-shrink: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      -webkit-user-drag: none;
      user-select: none;
    }
    .card__placeholder {
      width: calc(100% - 12px);
      height: calc(100% - 12px);
      background: #fff;
      border: 0.5px solid #d7c7b5;
      border-radius: 2px;
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
      -webkit-line-clamp: var(--kq-card-title-lines, 3);
      -webkit-box-orient: vertical;
    }

    /* ── Polaroid-Modus ── */
    .card--polaroid {
      padding: 5px 5px 0;
      border: 0.3mm solid var(--kq-card-border-soft);
      border-radius: 2px;
      --kq-card-title-lines: var(--kq-card-title-lines-polaroid, 3);
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
      height: 6.5rem;
      --kq-card-title-lines: var(--kq-card-title-lines-kompakt, 3);
    }
    .card--kompakt .card__photo {
      width: 6.5rem;
      height: 6.5rem;
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
      font-size: 0.82rem;
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
