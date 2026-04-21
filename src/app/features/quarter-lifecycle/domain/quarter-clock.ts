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

  getNextQuarterIdFromQuarterId(quarterId: string): string {
    const match = quarterId.match(/(\d{4})-Q(\d)/);
    if (!match) {
      throw new Error(`Invalid quarter ID: ${quarterId}`);
    }
    let year = parseInt(match[1], 10);
    let quarter = parseInt(match[2], 10);
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
