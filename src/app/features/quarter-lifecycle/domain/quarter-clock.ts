export class QuarterClock {
  getQuarterId(date: Date): string {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}-Q${quarter}`;
  }

  getNextQuarterId(date: Date): string {
    let quarter = Math.floor(date.getMonth() / 3) + 1;
    let year = date.getFullYear();
    if (quarter === 4) {
      quarter = 1;
      year += 1;
    } else {
      quarter += 1;
    }
    return `${year}-Q${quarter}`;
  }

  isRolloverDue(activeQuarterId: string, currentQuarterId: string): boolean {
    return activeQuarterId !== currentQuarterId;
  }
}
