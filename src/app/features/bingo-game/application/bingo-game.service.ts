import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { QUARTERLY_PLAN_READER } from '../../board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGame, createBoardSignature } from '../domain/bingo-game';

@Injectable()
export class BingoGameService {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());
  private readonly _definitionChallenges = signal<Challenge[]>([]);

  readonly challenges: Signal<Challenge[]> = computed(() => this.gameState().challenges as Challenge[]);
  readonly definitionChallenges: Signal<Challenge[]> = this._definitionChallenges.asReadonly();
  readonly effectiveChallenges: Signal<Challenge[]> = computed(() => {
    const game = this.gameState().challenges as Challenge[];
    const def = this._definitionChallenges();
    return game.map((c, i) => ({
      name: c.name,
      imageId: c.imageId ?? def[i]?.imageId,
    }));
  });
  readonly completed: Signal<boolean[]> = computed(() => this.gameState().completed as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);

  private readonly boardDefinitionRepository = inject(QUARTERLY_PLAN_READER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  constructor() {
    this.refreshFromDefinition();
  }

  hasPlayableBoard(): boolean {
    this.refreshFromDefinition();
    return !this.gameState().isEmpty;
  }

  updateCellImage(index: number, imageId: string | undefined): void {
    const updated = this.gameState().updateCellImage(index, imageId);
    this.persist(updated);
    this.gameState.set(updated);
  }

  resetProgress(): void {
    const reset = this.gameState().resetProgress();
    this.persist(reset);
    this.gameState.set(reset);
  }

  toggle(index: number): void {
    const toggled = this.gameState().toggle(index);
    this.persist(toggled);
    this.gameState.set(toggled);
  }

  private refreshFromDefinition(): void {
    const result = this.boardDefinitionRepository.load();
    if (!result.ok || result.value.challenges.length === 0) {
      this._definitionChallenges.set([]);
      this.gameState.set(BingoGame.empty());
      return;
    }

    const { id: boardDefinitionId, challenges } = result.value;
    this._definitionChallenges.set([...challenges]);
    const persistedProgress = this.bingoGameRepository.load();

    if (
      persistedProgress !== null &&
      persistedProgress.boardDefinitionId === boardDefinitionId &&
      persistedProgress.boardSignature === createBoardSignature(challenges)
    ) {
      this.gameState.set(BingoGame.restore(challenges, persistedProgress));
      return;
    }

    const game = BingoGame.fromDefinition(boardDefinitionId, challenges);
    this.persist(game);
    this.gameState.set(game);
  }

  private persist(game: BingoGame): void {
    this.bingoGameRepository.save(game.toProgress());
  }
}
