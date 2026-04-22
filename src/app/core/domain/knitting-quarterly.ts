import { QuarterId } from './quarter-id';

export type QuarterlyPhase = 'past' | 'current' | 'future';

export class KnittingQuarterly {
  private constructor(readonly quarterId: QuarterId) {}

  static create(params: {
    quarterId: QuarterId | string;
  }): KnittingQuarterly {
    return new KnittingQuarterly(QuarterId.from(params.quarterId));
  }

  static classifyPhase(quarterId: QuarterId | string, currentQuarterId: QuarterId | string): QuarterlyPhase {
    const candidate = QuarterId.from(quarterId);
    const current = QuarterId.from(currentQuarterId);

    if (candidate.isBefore(current)) {
      return 'past';
    }
    if (candidate.isAfter(current)) {
      return 'future';
    }

    return 'current';
  }

  phaseAt(currentQuarterId: QuarterId | string): QuarterlyPhase {
    return KnittingQuarterly.classifyPhase(this.quarterId, currentQuarterId);
  }

  isFuturePreview(currentQuarterId: QuarterId | string): boolean {
    return this.phaseAt(currentQuarterId) === 'future';
  }
}
