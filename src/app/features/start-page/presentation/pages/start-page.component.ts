import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { BINGO_GAME_REPOSITORY } from '../../../../features/bingo-game/domain/bingo-game.repository';
import { ENSURE_QUARTER_ROLLOVER_IN_PORT } from '../../../../core/application/ports/in/ensure-quarter-rollover.in-port';
import { QuarterClock, QuarterId } from '../../../../core/domain';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="start-page" data-testid="page-start-root">
      <img
        class="logo"
        src="assets/logo.svg"
        alt="Logo von Knitting Quarterly Bingo"
        data-testid="page-start-logo"
        width="420"
        height="420"
      />

      <nav class="actions" aria-label="Startaktionen">
        <div class="mode-toggle" role="group" aria-label="Spielen oder Planen">
          <button
            type="button"
            class="mode-option mode-option--left"
            data-testid="action-start-play"
            (click)="goToPlay()"
          >
            Spielen
          </button>
          <button
            type="button"
            class="mode-option mode-option--right"
            data-testid="action-start-plan"
            (click)="goToEdit()"
          >
            Planen
          </button>
        </div>

        <p class="motivation">
          {{ motivationText }}
        </p>

        <div class="archive-action">
          <kq-button data-testid="action-start-open-archive" variant="ghost" title="Archiv anzeigen" (click)="goToArchive()">
            Archiv
          </kq-button>
          <kq-button data-testid="action-start-open-howto" variant="ghost" title="Wie funktioniert Knitting Quarterly Bingo?" (click)="goToHowTo()">
            How-to
          </kq-button>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #ffffff;
    }

    .start-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      min-height: 100vh;
      max-width: 32rem;
      margin: 0 auto;
      padding: 2rem 1.25rem;
      color: #412a22;
    }

    .logo {
      width: min(420px, 80vw);
      height: auto;
      display: block;
    }

    .motivation {
      margin: 0;
      max-width: 36ch;
      text-align: center;
      line-height: 1.45;
      font-size: 1rem;
    }

    .mode-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: min(24rem, 100%);
      border: 1px solid #be7759;
      border-radius: 999px;
      overflow: hidden;
      background: #fff7ec;
    }

    .mode-option {
      border: 0;
      background: transparent;
      color: #7b371f;
      font: inherit;
      font-weight: 700;
      letter-spacing: 0.02em;
      padding: 0.92rem 1rem;
      cursor: pointer;
      transition: background 0.18s ease, color 0.18s ease;
    }

    .mode-option--left {
      border-right: 1px solid #d7a38b;
      background: linear-gradient(135deg, #c46e35 0%, #9f4b27 100%);
      color: #fff7ec;
    }

    .mode-option--right {
      background: #fff7ec;
    }

    .mode-option:hover {
      background: #fde8df;
      color: #6a2d18;
    }

    .mode-option--left:hover {
      background: linear-gradient(135deg, #b15f2a 0%, #8b3f1f 100%);
      color: #fff7ec;
    }

    .mode-option:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.35);
      outline-offset: -3px;
    }

    .archive-action {
      margin-top: 0.75rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      width: min(24rem, 100%);
      gap: 0.9rem;
    }

    @media (max-width: 480px) {
      .start-page {
        gap: 1.5rem;
        padding: 1.2rem 0.9rem;
      }

      .logo {
        width: min(320px, 86vw);
      }
    }
  `]
})
export class StartPageComponent {
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);
  private readonly quarterRollover = inject(ENSURE_QUARTER_ROLLOVER_IN_PORT);
  private readonly quarterClock = new QuarterClock();

  readonly daysUntilNextQuarterly = this.getDaysUntilNextQuarterly(new Date());
  readonly hasBingo = this.hasAnyBingoFromStoredProgress();
  readonly motivationText = this.getMotivationText(
    this.daysUntilNextQuarterly,
    this.hasBingo,
  );

  constructor(private router: Router) {
    this.quarterRollover.persistQuarterRollover();
  }

  goToEdit() {
    const currentQuarterId = this.quarterClock.getQuarterId(new Date());
    const planningQuarterId = this.quarterClock.getNextQuarterIdFromQuarterId(currentQuarterId);
    this.router.navigate(['/quarterly'], { queryParams: { quarter: planningQuarterId } });
  }

  goToPlay() {
    const currentQuarterId = this.quarterClock.getQuarterId(new Date());
    this.router.navigate(['/quarterly'], { queryParams: { quarter: currentQuarterId } });
  }

  goToArchive() {
    this.router.navigate(['/archive']);
  }

  goToHowTo() {
    this.router.navigate(['/how-it-works']);
  }

  private getDaysUntilNextQuarterly(today: Date): number {
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const nextQuarterStart = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 1);

    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const nextQuarterUtc = Date.UTC(
      nextQuarterStart.getFullYear(),
      nextQuarterStart.getMonth(),
      nextQuarterStart.getDate()
    );

    return Math.max(0, Math.ceil((nextQuarterUtc - todayUtc) / (1000 * 60 * 60 * 24)));
  }

  private getMotivationText(daysUntilNextQuarterly: number, hasBingo: boolean): string {
    if (hasBingo) {
      return 'Glueckwunsch, du hast schon ein Bingo geschafft!';
    }

    if (daysUntilNextQuarterly <= 14) {
      return `Noch ${daysUntilNextQuarterly} Tage bis zum naechsten Quarterly. Plane jetzt dein Board!`;
    }

    return `Noch ${daysUntilNextQuarterly} Tage Zeit: dranbleiben und Projekte eintragen. Du kannst noch ein Bingo schaffen.`;
  }

  private hasAnyBingoFromStoredProgress(): boolean {
    const currentQuarterId = QuarterId.parse(this.quarterClock.getQuarterId(new Date()));
    const progress = this.bingoGameRepository.load(currentQuarterId);
    if (progress === null) {
      return false;
    }

    const completed = progress.challenges.map(challenge => Boolean(challenge.completed));
    return this.hasBingoLine(completed);
  }

  private hasBingoLine(completed: readonly boolean[]): boolean {
    const size = Math.sqrt(completed.length);
    if (!Number.isInteger(size) || size < 2) {
      return false;
    }

    for (let r = 0; r < size; r++) {
      let rowComplete = true;
      for (let c = 0; c < size; c++) {
        rowComplete = rowComplete && completed[r * size + c];
      }
      if (rowComplete) {
        return true;
      }
    }

    for (let c = 0; c < size; c++) {
      let columnComplete = true;
      for (let r = 0; r < size; r++) {
        columnComplete = columnComplete && completed[r * size + c];
      }
      if (columnComplete) {
        return true;
      }
    }

    let diagonalAComplete = true;
    let diagonalBComplete = true;
    for (let i = 0; i < size; i++) {
      diagonalAComplete = diagonalAComplete && completed[i * size + i];
      diagonalBComplete = diagonalBComplete && completed[i * size + (size - 1 - i)];
    }

    return diagonalAComplete || diagonalBComplete;
  }
}
