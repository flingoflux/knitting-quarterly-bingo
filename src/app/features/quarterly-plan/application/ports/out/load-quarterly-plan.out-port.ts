import { InjectionToken } from '@angular/core';
import { QuarterlyPlanData } from '../../../domain/quarterly-plan.repository';
import { QuarterId } from '../../../../../core/domain';
import { Result } from '../../../../../shared/domain/result';

export interface LoadQuarterlyPlanOutPort {
  load(quarterId: QuarterId): Result<QuarterlyPlanData, string>;
  findById(id: QuarterId): Result<QuarterlyPlanData, string>;
}

export const LOAD_QUARTERLY_PLAN_OUT_PORT = new InjectionToken<LoadQuarterlyPlanOutPort>('LoadQuarterlyPlanOutPort');
