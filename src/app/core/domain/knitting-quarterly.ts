export type QuarterlyPhase = 'past' | 'current' | 'future';

export class KnittingQuarterly {
  private constructor(
    readonly quarterId: string,
    readonly boardDefinitionId: string,
    readonly gameBoardDefinitionId: string | null,
    readonly phase: QuarterlyPhase,
  ) {}

  static create(params: {
    quarterId: string;
    currentQuarterId: string;
    boardDefinitionId: string;
    gameBoardDefinitionId?: string | null;
  }): KnittingQuarterly {
    const phase = compareQuarterIds(params.quarterId, params.currentQuarterId) < 0
      ? 'past'
      : compareQuarterIds(params.quarterId, params.currentQuarterId) > 0
        ? 'future'
        : 'current';

    return new KnittingQuarterly(
      params.quarterId,
      params.boardDefinitionId,
      params.gameBoardDefinitionId ?? null,
      phase,
    );
  }

  canEditBoard(): boolean {
    if (this.phase === 'past') {
      return false;
    }
    return this.gameBoardDefinitionId === null;
  }

  canPlayBoard(): boolean {
    return this.phase !== 'past';
  }

  isArchivedViewRequired(): boolean {
    return this.phase === 'past';
  }

  isFuturePreview(): boolean {
    return this.phase === 'future';
  }
}

function compareQuarterIds(a: string, b: string): number {
  const parsedA = parseQuarterId(a);
  const parsedB = parseQuarterId(b);

  if (parsedA.year !== parsedB.year) {
    return parsedA.year - parsedB.year;
  }

  return parsedA.quarter - parsedB.quarter;
}

function parseQuarterId(quarterId: string): { year: number; quarter: number } {
  const match = quarterId.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    throw new Error(`Invalid quarter ID: ${quarterId}`);
  }

  return {
    year: Number.parseInt(match[1], 10),
    quarter: Number.parseInt(match[2], 10),
  };
}
