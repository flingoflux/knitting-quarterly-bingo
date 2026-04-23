import { InjectionToken } from '@angular/core';
import { QuarterId } from '../../../core/domain';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';

export interface QuarterlyPlanData {
  quarterId: string;
  challenges: Challenge[];
}

export interface QuarterlyPlanReader {
  load(quarterId: QuarterId): Result<QuarterlyPlanData, string>;
  findById(id: QuarterId): Result<QuarterlyPlanData, string>;
}

export const QUARTERLY_PLAN_READER = new InjectionToken<QuarterlyPlanReader>('QuarterlyPlanReader');

export interface QuarterlyPlanWriter {
  save(quarterId: QuarterId, plan: QuarterlyPlanData): void;
}

export const QUARTERLY_PLAN_WRITER = new InjectionToken<QuarterlyPlanWriter>('QuarterlyPlanWriter');
