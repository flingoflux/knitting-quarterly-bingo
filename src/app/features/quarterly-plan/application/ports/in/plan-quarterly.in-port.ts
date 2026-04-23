import { InjectionToken, Signal } from '@angular/core';
import { QuarterId } from '../../../../../core/domain';
import { Challenge } from '../../../../../shared/domain/challenge';

export interface PlanQuarterlyInPort {
  readonly challenges: Signal<Challenge[]>;
  readonly isPreviewMode: Signal<boolean>;

  setPreviewMode(enabled: boolean, quarterId?: QuarterId | string): void;
  persistDefaultQuarterlyPlan(): void;
  persistChallenges(challenges: Challenge[]): void;
  persistSwappedChallenges(startIndex: number, targetIndex: number): void;
  persistUpdatedChallenge(index: number, challenge: Challenge): void;
  persistDefaultChallengesWithoutImages(): void;
}

export const PLAN_QUARTERLY_IN_PORT = new InjectionToken<PlanQuarterlyInPort>('PlanQuarterlyInPort');
