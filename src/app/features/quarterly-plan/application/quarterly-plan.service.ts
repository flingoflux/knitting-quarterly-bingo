import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../domain/quarterly-plan.repository';
import { QuarterlyPlan } from '../domain/quarterly-plan';
import { QuarterClock } from '../../../core/domain';

@Injectable()
export class QuarterlyPlanService {
  private readonly quarterClock = new QuarterClock();
  private readonly activeQuarterId = signal(this.quarterClock.getQuarterId(new Date()));
  private readonly planState = signal<QuarterlyPlan>(QuarterlyPlan.createDefault(this.activeQuarterId()));
  private readonly previewMode = signal(false);
  readonly challenges: Signal<Challenge[]> = computed(() => this.planState().challenges as Challenge[]);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly reader = inject(QUARTERLY_PLAN_READER);
  private readonly writer = inject(QUARTERLY_PLAN_WRITER);

  constructor() {
    const result = this.reader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.planState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    this.resetPlan();
  }

  setPreviewMode(enabled: boolean, quarterId?: string): void {
    this.previewMode.set(enabled);
    this.activeQuarterId.set(quarterId ?? this.quarterClock.getQuarterId(new Date()));

    const result = this.reader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.planState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    if (enabled) {
      const previewQuarterId = quarterId || 'preview-quarter';
      this.planState.set(QuarterlyPlan.createDefault(previewQuarterId));
      return;
    }

    this.resetPlan();
  }

  resetPlan(): void {
    this.planState.set(QuarterlyPlan.createDefault(this.activeQuarterId()));
    this.persist();
  }

  setChallenges(challenges: Challenge[]): void {
    this.planState.set(QuarterlyPlan.fromChallenges(challenges, this.planState().quarterId));
    this.persist();
  }

  swapChallenges(startIndex: number, targetIndex: number): void {
    this.planState.set(this.planState().reorder(startIndex, targetIndex));
    this.persist();
  }

  updateChallenge(index: number, challenge: Challenge): void {
    this.planState.set(this.planState().update(index, challenge));
    this.persist();
  }

  resetToDefaultChallengesWithoutImages(): void {
    const defaultChallenges = DEFAULT_CHALLENGES.map(challenge => ({ name: challenge.name }));
    this.planState.set(QuarterlyPlan.fromChallenges(defaultChallenges, this.planState().quarterId));
    this.persist();
  }

  private persist(): void {
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    this.writer.save(this.activeQuarterId(), {
      ...this.planState().toPersistable(),
    });
  }
}
