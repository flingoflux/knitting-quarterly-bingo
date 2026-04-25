import { Injectable, inject } from '@angular/core';
import { LOAD_BINGO_PROGRESS_OUT_PORT } from '../../bingo-game/application/ports/out/load-bingo-progress.out-port';
import { QuarterClock, QuarterId } from '../../../core/domain';
import { ShowQuarterlyProgressInPort } from './ports/in/show-quarterly-progress.in-port';

@Injectable()
export class ShowQuarterlyProgressUseCase implements ShowQuarterlyProgressInPort {
  private readonly bingoProgressLoader = inject(LOAD_BINGO_PROGRESS_OUT_PORT);
  private readonly quarterClock = new QuarterClock();

  readonly hasBingoThisQuarter: boolean = this.loadHasBingo();
  readonly daysUntilNextQuarter: number = this.loadDaysUntilNextQuarter();

  private loadHasBingo(): boolean {
    const currentQuarterId = QuarterId.parse(this.quarterClock.getQuarterId(new Date()));
    const progress = this.bingoProgressLoader.load(currentQuarterId);
    if (progress === null) {
      return false;
    }
    const completed = progress.challenges.map(c => Boolean(c.completed));
    return this.hasBingoLine(completed);
  }

  private loadDaysUntilNextQuarter(): number {
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const nextQuarterStart = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 1);
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const nextQuarterUtc = Date.UTC(
      nextQuarterStart.getFullYear(),
      nextQuarterStart.getMonth(),
      nextQuarterStart.getDate(),
    );
    return Math.max(0, Math.ceil((nextQuarterUtc - todayUtc) / (1000 * 60 * 60 * 24)));
  }

  private hasBingoLine(completed: boolean[]): boolean {
    const size = 4;
    const rows = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => completed[r * size + c]),
    );

    const hasRowBingo = rows.some(row => row.every(Boolean));
    const hasColBingo = Array.from({ length: size }, (_, c) =>
      rows.every(row => row[c]),
    ).some(Boolean);
    const hasDiag1 = Array.from({ length: size }, (_, i) => rows[i][i]).every(Boolean);
    const hasDiag2 = Array.from({ length: size }, (_, i) => rows[i][size - 1 - i]).every(Boolean);

    return hasRowBingo || hasColBingo || hasDiag1 || hasDiag2;
  }
}
