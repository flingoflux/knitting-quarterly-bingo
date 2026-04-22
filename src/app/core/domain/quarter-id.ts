export class QuarterId {
  private constructor(
    private readonly year: number,
    private readonly quarter: number,
  ) {}

  static from(value: QuarterId | string): QuarterId {
    return value instanceof QuarterId ? value : QuarterId.parse(value);
  }

  static parse(value: string): QuarterId {
    const match = value.match(/^(\d{4})-Q([1-4])$/);
    if (!match) {
      throw new Error(`Invalid quarter ID: ${value}`);
    }

    return new QuarterId(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10));
  }

  static tryParse(value: string): QuarterId | null {
    try {
      return QuarterId.parse(value);
    } catch {
      return null;
    }
  }

  static fromDate(date: Date): QuarterId {
    return new QuarterId(date.getFullYear(), Math.floor(date.getMonth() / 3) + 1);
  }

  toString(): string {
    return `${this.year}-Q${this.quarter}`;
  }

  compareTo(other: QuarterId): number {
    if (this.year !== other.year) {
      return this.year - other.year;
    }

    return this.quarter - other.quarter;
  }

  isBefore(other: QuarterId): boolean {
    return this.compareTo(other) < 0;
  }

  isAfter(other: QuarterId): boolean {
    return this.compareTo(other) > 0;
  }

  equals(other: QuarterId): boolean {
    return this.compareTo(other) === 0;
  }

  next(): QuarterId {
    if (this.quarter === 4) {
      return new QuarterId(this.year + 1, 1);
    }

    return new QuarterId(this.year, this.quarter + 1);
  }

  previous(): QuarterId {
    if (this.quarter === 1) {
      return new QuarterId(this.year - 1, 4);
    }

    return new QuarterId(this.year, this.quarter - 1);
  }
}