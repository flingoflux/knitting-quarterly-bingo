import { InjectionToken } from '@angular/core';
import { QuarterLifecycleState } from './quarter-lifecycle-state';

export interface QuarterLifecycleStateRepository {
  load(): QuarterLifecycleState | null;
  save(state: QuarterLifecycleState): void;
  clear(): void;
}

export const QUARTER_LIFECYCLE_STATE_REPOSITORY = new InjectionToken<QuarterLifecycleStateRepository>(
  'QuarterLifecycleStateRepository',
);
