import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export type KqCardMode = 'polaroid' | 'horizontal';

/**
 * Wiederverwendbare Bingo-Karte (Molecule).
 * Wird sowohl im Spiel-Modus (playable-board) als auch im Bearbeitungs-Modus (editable-board) genutzt.
 *
 * Inputs:
 *  - name: Projektname
 *  - imageUrl: URL des Fotos (null = Platzhalter)
 *  - mode: polaroid | horizontal
 *  - done: Abgehakt?
 *  - inBingo: Teil einer Bingo-Reihe?
 *  - showCameraButton: Kamera-Button anzeigen?
 *
 * Outputs:
 *  - cameraClicked: Kamera-Button wurde geklickt
 */
@Component({
  selector: 'kq-challenge-card',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  template: `
    <div
      class="card"
      [class.card--polaroid]="mode === 'polaroid'"
      [class.card--horizontal]="mode === 'horizontal'"
      [class.card--done]="done"
      [class.card--bingo]="inBingo"
      [class.card--hoverable]="hoverable"
    >
      <div class="card__photo" [class.card__photo--editing]="editing">
        <img
          *ngIf="imageUrl"
          [src]="imageUrl"
          class="card__img"
          [alt]="name"
        />
        <div *ngIf="!imageUrl" class="card__placeholder">
          <img src="assets/logo_plain.svg" class="card__logo-placeholder" alt="" />
        </div>

        <kq-badge *ngIf="done" variant="done" [compact]="mode === 'horizontal'"/>
        <kq-badge *ngIf="inBingo" variant="bingo" [compact]="mode === 'horizontal'"/>

        <button
          *ngIf="showCameraButton"
          type="button"
          class="card__camera-btn"
          title="Foto ansehen / hochladen"
          aria-label="Foto ansehen oder hochladen"
          (click)="onCameraClick($event)"
        >
          <kq-icon name="camera" [size]="13"/>
        </button>

        <ng-content select="[slot=photo-overlay]"/>
      </div>

      <div class="card__caption">
        <ng-content select="[slot=caption-action]"/>
        <ng-content select="[slot=caption-title]">
          <div class="card__title">{{ name }}</div>
        </ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    /* ── Basis ── */
    .card {
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 5px rgba(60, 30, 10, 0.14), 0 8px 20px rgba(60, 30, 10, 0.10);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card--hoverable:hover {
      transform: translateY(-3px) rotate(0.3deg);
      box-shadow: 0 6px 14px rgba(60, 30, 10, 0.18), 0 16px 32px rgba(60, 30, 10, 0.13);
    }
    .card--bingo {
      box-shadow: 0 0 0 3px #145906, 0 8px 22px rgba(20, 89, 6, 0.22);
    }
    .card--bingo:hover {
      box-shadow: 0 0 0 3px #145906, 0 8px 22px rgba(20, 89, 6, 0.22);
    }

    /* ── Foto-Bereich ── */
    .card__photo {
      position: relative;
      background: #f2e8d8;
      overflow: hidden;
      flex-shrink: 0;
    }
    .card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9a878;
    }
    .card__logo-placeholder {
      width: 58px;
      height: 58px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(73%) sepia(28%) saturate(500%)
              hue-rotate(355deg) brightness(94%) contrast(88%) opacity(0.45);
    }

    .card__photo--editing {
      opacity: 0.45;
    }

    /* ── Kamera-Button ── */
    .card__camera-btn {
      position: absolute;
      bottom: 5px;
      right: 5px;
      border: 1.5px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      width: 26px;
      height: 26px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: #5a2d1a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: background 0.18s, transform 0.15s;
    }
    .card__camera-btn:hover,
    .card__camera-btn:focus-visible {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.1);
    }
    .card__camera-btn:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.5);
      outline-offset: 2px;
    }

    /* ── Caption ── */
    .card__caption {
      background: #fff;
      display: flex;
      flex-direction: column;
      flex: 1;
      position: relative;
    }
    .card__title {
      font-weight: 700;
      color: #4a2d1c;
      line-height: 1.25;
      text-wrap: balance;
    }

    /* ── Polaroid-Modus ── */
    .card--polaroid {
      padding: 7px 7px 0;
      border-radius: 5px;
    }
    .card--polaroid .card__photo {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 2px;
    }
    .card--polaroid .card__caption {
      padding: 0.45rem 0.2rem 0.6rem;
      align-items: center;
      min-height: 44px;
    }
    .card--polaroid .card__title {
      font-size: 0.74rem;
      text-align: center;
    }

    /* ── Horizontal-Modus ── */
    .card--horizontal {
      flex-direction: row;
      align-items: stretch;
      height: 4.8rem;
    }
    .card--horizontal.card--hoverable:hover {
      transform: translateY(-2px) rotate(0deg);
    }
    .card--horizontal .card__photo {
      width: 4.8rem;
      height: 4.8rem;
      aspect-ratio: unset;
      flex-shrink: 0;
    }
    .card--horizontal .card__camera-btn {
      width: 22px;
      height: 22px;
      bottom: 4px;
      right: 4px;
    }
    .card--horizontal .card__caption {
      flex: 1;
      align-items: flex-start;
      justify-content: center;
      padding: 0.35rem 0.5rem 0.35rem 0.45rem;
      min-height: unset;
      overflow: hidden;
    }
    .card--horizontal .card__title {
      font-size: 0.7rem;
      text-align: left;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class ChallengeCardComponent {
  @Input({ required: true }) name!: string;
  @Input() imageUrl: string | null = null;
  @Input() mode: KqCardMode = 'polaroid';
  @Input() done = false;
  @Input() inBingo = false;
  @Input() showCameraButton = true;
  @Input() editing = false;
  @Input() hoverable = true;

  @Output() cameraClicked = new EventEmitter<MouseEvent>();

  onCameraClick(event: MouseEvent): void {
    event.stopPropagation();
    this.cameraClicked.emit(event);
  }
}
