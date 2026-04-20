import { InjectionToken } from '@angular/core';
import { Challenge } from '../domain/challenge';

export interface QuarterlyPlanPortReader {
  load(): { challenges: Challenge[] } | null;
}

export const QUARTERLY_PLAN_PORT_READER = new InjectionToken<QuarterlyPlanPortReader>('QuarterlyPlanPortReader');
