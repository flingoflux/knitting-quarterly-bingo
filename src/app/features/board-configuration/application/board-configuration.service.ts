import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../domain/quarterly-plan.repository';
import { QuarterlyPlan } from '../domain/quarterly-plan';
import { QuarterClock } from '../../../core/domain';

@Injectable()
export class BoardConfigurationService {
  private readonly quarterClock = new QuarterClock();
  private readonly activeQuarterId = signal(this.quarterClock.getQuarterId(new Date()));
  private readonly boardState = signal<QuarterlyPlan>(QuarterlyPlan.createDefault(this.activeQuarterId()));
  private readonly previewMode = signal(false);
  readonly challenges: Signal<Challenge[]> = computed(() => this.boardState().challenges as Challenge[]);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly reader = inject(QUARTERLY_PLAN_READER);
  private readonly writer = inject(QUARTERLY_PLAN_WRITER);

  constructor() {
    const result = this.reader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.boardState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    this.resetBoard();
  }

  setPreviewMode(enabled: boolean, quarterId?: string): void {
    this.previewMode.set(enabled);
    this.activeQuarterId.set(quarterId ?? this.quarterClock.getQuarterId(new Date()));

    const result = this.reader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.boardState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    if (enabled) {
      const previewQuarterId = quarterId || 'preview-quarter';
      this.boardState.set(QuarterlyPlan.createDefault(previewQuarterId));
      return;
    }

    this.resetBoard();
  }

  resetBoard(): void {
    this.boardState.set(QuarterlyPlan.createDefault(this.activeQuarterId()));
    this.persist();
  }

  setChallenges(challenges: Challenge[]): void {
    this.boardState.set(QuarterlyPlan.fromChallenges(challenges, this.boardState().quarterId));
    this.persist();
  }

  swapChallenges(startIndex: number, targetIndex: number): void {
    this.boardState.set(this.boardState().reorder(startIndex, targetIndex));
    this.persist();
  }

  updateChallenge(index: number, challenge: Challenge): void {
    this.boardState.set(this.boardState().update(index, challenge));
    this.persist();
  }

  resetToDefaultChallengesWithoutImages(): void {
    const defaultChallenges = DEFAULT_CHALLENGES.map(challenge => ({ name: challenge.name }));
    this.boardState.set(QuarterlyPlan.fromChallenges(defaultChallenges, this.boardState().quarterId));
    this.persist();
  }

  private persist(): void {
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    this.writer.save(this.activeQuarterId(), {
      ...this.boardState().toPersistable(),
    });
  }
}
