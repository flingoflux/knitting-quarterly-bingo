import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { ChallengeProgress } from '../domain/bingo-game';
import { QUARTERLY_PLAN_READER } from '../../board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGame, createBoardSignature } from '../domain/bingo-game';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { QuarterClock } from '../../quarter-lifecycle/domain/quarter-clock';

@Injectable()
export class BingoGameService {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());
  private readonly previewMode = signal(false);
  private readonly quarterClock = new QuarterClock();
  private readonly activeQuarterId = signal(this.quarterClock.getQuarterId(new Date()));

  readonly challenges: Signal<ChallengeProgress[]> = computed(() => this.gameState().challenges as ChallengeProgress[]);
  readonly completed: Signal<boolean[]> = computed(() => this.gameState().completed as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly quarterlyPlanRepository = inject(QUARTERLY_PLAN_READER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  constructor() {
    this.refreshFromDefinition(this.activeQuarterId());
  }

  setPreviewMode(enabled: boolean, quarterId?: string): void {
    this.previewMode.set(enabled);
    this.activeQuarterId.set(quarterId ?? this.quarterClock.getQuarterId(new Date()));
    this.refreshFromDefinition(this.activeQuarterId());

    if (enabled) {
      const id = quarterId || 'preview-quarter';
      const game = BingoGame.fromDefinition(id, DEFAULT_CHALLENGES);
      this.gameState.set(game);
    }
  }

  hasPlayableBoard(quarterId?: string): boolean {
    if (quarterId) {
      this.activeQuarterId.set(quarterId);
    }
    this.refreshFromDefinition(this.activeQuarterId());
    return !this.gameState().isEmpty;
  }

  updateProgressImage(index: number, imageId: string | undefined): void {
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    const updated = this.gameState().updateProgressImage(index, imageId);
    this.persist(updated);
    this.gameState.set(updated);
  }

  resetProgress(): void {
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    const reset = this.gameState().resetProgress();
    this.persist(reset);
    this.gameState.set(reset);
  }

  toggle(index: number): void {
    if (this.previewMode()) {
      // Im Vorschau-Modus: toggle lokal, aber nicht persistieren
      const toggled = this.gameState().toggle(index);
      this.gameState.set(toggled);
      return;
    }
    const toggled = this.gameState().toggle(index);
    this.persist(toggled);
    this.gameState.set(toggled);
  }

  private refreshFromDefinition(quarterId: string): void {
    const result = this.quarterlyPlanRepository.load(quarterId);
    if (!result.ok || result.value.challenges.length === 0) {
      this.gameState.set(BingoGame.empty());
      return;
    }

    const { id: boardDefinitionId, challenges } = result.value;
    const persistedProgress = this.bingoGameRepository.load(quarterId);

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
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    this.bingoGameRepository.save(this.activeQuarterId(), game.toProgress());
  }
}
