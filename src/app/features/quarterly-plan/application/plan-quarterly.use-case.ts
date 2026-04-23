import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { QuarterClock, QuarterId } from '../../../core/domain';
import { Challenge } from '../../../shared/domain/challenge';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { QuarterlyPlan } from '../domain/quarterly-plan';
import { PlanQuarterlyInPort } from './ports/in/plan-quarterly.in-port';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from './ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from './ports/out/persist-quarterly-plan.out-port';

@Injectable()
export class PlanQuarterlyUseCase implements PlanQuarterlyInPort {
  private readonly quarterClock = new QuarterClock();
  private readonly activeQuarterId = signal(QuarterId.parse(this.quarterClock.getQuarterId(new Date())));
  private readonly planState = signal<QuarterlyPlan>(QuarterlyPlan.createDefault(this.activeQuarterId()));
  private readonly previewMode = signal(false);

  readonly challenges: Signal<Challenge[]> = computed(() => this.planState().challenges as Challenge[]);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly loader = inject(LOAD_QUARTERLY_PLAN_OUT_PORT);
  private readonly persister = inject(PERSIST_QUARTERLY_PLAN_OUT_PORT);

  constructor() {
    const result = this.loader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.planState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    this.persistDefaultQuarterlyPlan();
  }

  setPreviewMode(enabled: boolean, quarterId?: QuarterId | string): void {
    const resolvedQuarterId = quarterId ? QuarterId.from(quarterId) : QuarterId.parse(this.quarterClock.getQuarterId(new Date()));
    this.previewMode.set(enabled);
    this.activeQuarterId.set(resolvedQuarterId);

    const result = this.loader.load(this.activeQuarterId());
    if (result.ok && result.value.challenges.length > 0) {
      this.planState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.quarterId));
      return;
    }

    if (enabled) {
      this.planState.set(QuarterlyPlan.createDefault(resolvedQuarterId));
      return;
    }

    this.persistDefaultQuarterlyPlan();
  }

  persistDefaultQuarterlyPlan(): void {
    this.planState.set(QuarterlyPlan.createDefault(this.activeQuarterId()));
    this.persistQuarterlyPlan();
  }

  persistChallenges(challenges: Challenge[]): void {
    this.planState.set(QuarterlyPlan.fromChallenges(challenges, this.planState().quarterId));
    this.persistQuarterlyPlan();
  }

  persistSwappedChallenges(startIndex: number, targetIndex: number): void {
    this.planState.set(this.planState().reorder(startIndex, targetIndex));
    this.persistQuarterlyPlan();
  }

  persistUpdatedChallenge(index: number, challenge: Challenge): void {
    this.planState.set(this.planState().update(index, challenge));
    this.persistQuarterlyPlan();
  }

  persistDefaultChallengesWithoutImages(): void {
    const defaultChallenges = DEFAULT_CHALLENGES.map(challenge => ({ name: challenge.name }));
    this.planState.set(QuarterlyPlan.fromChallenges(defaultChallenges, this.planState().quarterId));
    this.persistQuarterlyPlan();
  }

  private persistQuarterlyPlan(): void {
    if (this.previewMode()) {
      return;
    }

    this.persister.persist(this.activeQuarterId(), {
      ...this.planState().toPersistable(),
    });
  }
}
