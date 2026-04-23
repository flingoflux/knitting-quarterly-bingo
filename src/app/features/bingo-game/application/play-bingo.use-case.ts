import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { QuarterClock, QuarterId } from '../../../core/domain';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { BingoGame, ChallengeProgress, createPlanSignature } from '../domain/bingo-game';
import { PlayBingoInPort } from './ports/in/play-bingo.in-port';
import { LOAD_BINGO_PROGRESS_OUT_PORT } from './ports/out/load-bingo-progress.out-port';
import { PERSIST_BINGO_PROGRESS_OUT_PORT } from './ports/out/persist-bingo-progress.out-port';

@Injectable()
export class PlayBingoUseCase implements PlayBingoInPort {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());
  private readonly previewMode = signal(false);
  private readonly quarterClock = new QuarterClock();
  private readonly activeQuarterId = signal(QuarterId.parse(this.quarterClock.getQuarterId(new Date())));

  readonly challenges: Signal<ChallengeProgress[]> = computed(() => this.gameState().challenges as ChallengeProgress[]);
  readonly completed: Signal<boolean[]> = computed(() => this.gameState().completed as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly quarterlyPlanLoader = inject(LOAD_QUARTERLY_PLAN_OUT_PORT);
  private readonly bingoProgressLoader = inject(LOAD_BINGO_PROGRESS_OUT_PORT);
  private readonly bingoProgressPersister = inject(PERSIST_BINGO_PROGRESS_OUT_PORT);

  constructor() {
    this.refreshFromDefinition(this.activeQuarterId());
  }

  setPreviewMode(enabled: boolean, quarterId?: QuarterId | string): void {
    const resolvedQuarterId = quarterId ? QuarterId.from(quarterId) : QuarterId.parse(this.quarterClock.getQuarterId(new Date()));
    this.previewMode.set(enabled);
    this.activeQuarterId.set(resolvedQuarterId);
    this.refreshFromDefinition(this.activeQuarterId());

    if (enabled) {
      const game = BingoGame.fromDefinition(resolvedQuarterId, DEFAULT_CHALLENGES);
      this.gameState.set(game);
    }
  }

  isQuarterPlayable(quarterId: QuarterId | string, restartRequested: boolean): boolean {
    const resolvedQuarterId = QuarterId.from(quarterId);
    this.activeQuarterId.set(resolvedQuarterId);
    if (restartRequested) {
      this.bingoProgressPersister.clear(resolvedQuarterId);
    }
    this.refreshFromDefinition(resolvedQuarterId);
    return !this.gameState().isEmpty;
  }

  persistProgressImage(index: number, imageId: string | undefined): void {
    if (this.previewMode()) {
      return;
    }

    const updated = this.gameState().updateProgressImage(index, imageId);
    this.persistBingoProgress(updated);
    this.gameState.set(updated);
  }

  persistResetProgress(): void {
    if (this.previewMode()) {
      return;
    }

    const reset = this.gameState().resetProgress();
    this.persistBingoProgress(reset);
    this.gameState.set(reset);
  }

  persistToggledChallenge(index: number): void {
    if (this.previewMode()) {
      const toggled = this.gameState().toggle(index);
      this.gameState.set(toggled);
      return;
    }

    const toggled = this.gameState().toggle(index);
    this.persistBingoProgress(toggled);
    this.gameState.set(toggled);
  }

  private refreshFromDefinition(quarterId: QuarterId): void {
    const result = this.quarterlyPlanLoader.load(quarterId);
    if (!result.ok || result.value.challenges.length === 0) {
      this.gameState.set(BingoGame.empty());
      return;
    }

    const { challenges } = result.value;
    const persistedProgress = this.bingoProgressLoader.load(quarterId);

    if (
      persistedProgress !== null &&
      persistedProgress.quarterId === quarterId.toString() &&
      persistedProgress.planSignature === createPlanSignature(challenges)
    ) {
      this.gameState.set(BingoGame.restore(challenges, persistedProgress));
      return;
    }

    const game = BingoGame.fromDefinition(quarterId, challenges);
    this.persistBingoProgress(game);
    this.gameState.set(game);
  }

  private persistBingoProgress(game: BingoGame): void {
    if (this.previewMode()) {
      return;
    }

    this.bingoProgressPersister.persist(this.activeQuarterId(), game.toProgress());
  }
}
