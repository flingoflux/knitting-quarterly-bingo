import { QuarterId } from './quarter-id';

export type QuarterlyPhase = 'past' | 'current' | 'future';
export type QuarterlyLifecycleState = 'edit' | 'play' | 'archive';
export type QuarterlyMode = 'edit' | 'play' | 'archive';

export class KnittingQuarterly {
  private constructor(
    readonly quarterId: string,
    readonly boardDefinitionId: string,
    readonly lifecycleState: QuarterlyLifecycleState,
  ) {}

  static create(params: {
    quarterId: string;
    boardDefinitionId: string;
    lifecycleState?: QuarterlyLifecycleState;
    currentQuarterId?: string;
    gameBoardDefinitionId?: string | null;
  }): KnittingQuarterly {
    const lifecycleState = KnittingQuarterly.resolveLifecycleState(params);

    return new KnittingQuarterly(params.quarterId, params.boardDefinitionId, lifecycleState);
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

  modeAt(currentQuarterId: string): QuarterlyMode {
    const phase = this.phaseAt(currentQuarterId);
    if (phase === 'past' || this.lifecycleState === 'archive') {
      return 'archive';
    }

    if (phase === 'future') {
      return 'edit';
    }

    return this.lifecycleState === 'play' ? 'play' : 'edit';
  }

  canStartGame(currentQuarterId: string): boolean {
    return this.modeAt(currentQuarterId) === 'edit';
  }

  canArchive(_currentQuarterId: string): boolean {
    return this.lifecycleState !== 'archive';
  }

  startGame(currentQuarterId: string): KnittingQuarterly {
    if (!this.canStartGame(currentQuarterId)) {
      throw new Error('Quarterly cannot transition to play from current state');
    }

    return new KnittingQuarterly(this.quarterId, this.boardDefinitionId, 'play');
  }

  archive(currentQuarterId: string): KnittingQuarterly {
    if (!this.canArchive(currentQuarterId)) {
      throw new Error('Quarterly cannot transition to archive from current state');
    }

    return new KnittingQuarterly(this.quarterId, this.boardDefinitionId, 'archive');
  }

  canEditBoard(currentQuarterId: string): boolean {
    return this.modeAt(currentQuarterId) === 'edit';
  }

  canPlayBoard(currentQuarterId: string): boolean {
    return this.modeAt(currentQuarterId) === 'play';
  }

  isArchivedViewRequired(currentQuarterId: string): boolean {
    return this.modeAt(currentQuarterId) === 'archive';
  }

  isFuturePreview(currentQuarterId: string): boolean {
    return this.phaseAt(currentQuarterId) === 'future';
  }

  private static resolveLifecycleState(params: {
    quarterId: string;
    boardDefinitionId: string;
    lifecycleState?: QuarterlyLifecycleState;
    currentQuarterId?: string;
    gameBoardDefinitionId?: string | null;
  }): QuarterlyLifecycleState {
    if (params.lifecycleState) {
      return params.lifecycleState;
    }

    if (params.currentQuarterId && KnittingQuarterly.classifyPhase(params.quarterId, params.currentQuarterId) === 'past') {
      return 'archive';
    }

    if (params.gameBoardDefinitionId !== null && params.gameBoardDefinitionId !== undefined) {
      return 'play';
    }

    return 'edit';
  }
}
