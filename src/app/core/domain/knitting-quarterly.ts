import { QuarterId } from './quarter-id';

export type QuarterlyPhase = 'past' | 'current' | 'future';

export class KnittingQuarterly {
  private constructor(readonly quarterId: string) {}

  static create(params: {
    quarterId: string;
  }): KnittingQuarterly {
    return new KnittingQuarterly(params.quarterId);
  }

  static classifyPhase(quarterId: string, currentQuarterId: string): QuarterlyPhase {
    const candidate = QuarterId.parse(quarterId);
    const current = QuarterId.parse(currentQuarterId);

    if (candidate.isBefore(current)) {
      return 'past';
    }
    if (candidate.isAfter(current)) {
      return 'future';
    }

    return 'current';
  }

  phaseAt(currentQuarterId: string): QuarterlyPhase {
    return KnittingQuarterly.classifyPhase(this.quarterId, currentQuarterId);
  }

  isFuturePreview(currentQuarterId: string): boolean {
    return this.phaseAt(currentQuarterId) === 'future';
  }
}
