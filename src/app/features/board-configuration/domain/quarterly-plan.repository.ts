import { InjectionToken } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';

export interface QuarterlyPlanData {
  id: string;
  challenges: Challenge[];
}

export interface QuarterlyPlanReader {
  load(): Result<QuarterlyPlanData, string>;
  findById(id: string): Result<QuarterlyPlanData, string>;
}

export const QUARTERLY_PLAN_READER = new InjectionToken<QuarterlyPlanReader>('QuarterlyPlanReader');

export interface QuarterlyPlanWriter {
  save(plan: QuarterlyPlanData): void;
}

export const QUARTERLY_PLAN_WRITER = new InjectionToken<QuarterlyPlanWriter>('QuarterlyPlanWriter');
