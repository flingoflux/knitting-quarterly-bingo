import { QuarterId } from './quarter-id';

export class QuarterClock {
  getQuarterId(date: Date): string {
    return QuarterId.fromDate(date).toString();
  }

  getNextQuarterId(date: Date): string {
    return QuarterId.fromDate(date).next().toString();
  }

  getNextQuarterIdFromQuarterId(quarterId: string): string {
    return QuarterId.parse(quarterId).next().toString();
  }

  getPreviousQuarterIdFromQuarterId(quarterId: string): string {
    return QuarterId.parse(quarterId).previous().toString();
  }

  compareQuarterIds(a: string, b: string): number {
    return QuarterId.parse(a).compareTo(QuarterId.parse(b));
  }

  isPastQuarter(quarterId: string, currentQuarterId: string): boolean {
    return this.compareQuarterIds(quarterId, currentQuarterId) < 0;
  }

  isRolloverDue(activeQuarterId: string, currentQuarterId: string): boolean {
    return !QuarterId.parse(activeQuarterId).equals(QuarterId.parse(currentQuarterId));
  }
}
