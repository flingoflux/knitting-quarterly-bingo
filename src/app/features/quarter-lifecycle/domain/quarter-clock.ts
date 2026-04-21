export class QuarterClock {
  getQuarterId(date: Date): string {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}-Q${quarter}`;
  }

  isRolloverDue(activeQuarterId: string, currentQuarterId: string): boolean {
    return activeQuarterId !== currentQuarterId;
  }
}
