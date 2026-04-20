import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { ChallengeProgress } from '../domain/bingo-game';
import { QUARTERLY_PLAN_READER } from '../../board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGame, createBoardSignature } from '../domain/bingo-game';

@Injectable()
export class BingoGameService {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());

  readonly challenges: Signal<ChallengeProgress[]> = computed(() => this.gameState().challenges as ChallengeProgress[]);
  readonly completed: Signal<boolean[]> = computed(() => this.gameState().completed as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);

  private readonly quarterlyPlanRepository = inject(QUARTERLY_PLAN_READER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  constructor() {
    this.refreshFromDefinition();
  }

  hasPlayableBoard(): boolean {
    this.refreshFromDefinition();
    return !this.gameState().isEmpty;
  }

  updateProgressImage(index: number, imageId: string | undefined): void {
    const updated = this.gameState().updateProgressImage(index, imageId);
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
    const result = this.quarterlyPlanRepository.load();
    if (!result.ok || result.value.challenges.length === 0) {
      this.gameState.set(BingoGame.empty());
      return;
    }

    const { id: boardDefinitionId, challenges } = result.value;
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
