import { InjectionToken } from '@angular/core';
import { QuarterlyPlanData } from '../../../domain/quarterly-plan.repository';
import { QuarterId } from '../../../../../core/domain';

export interface PersistQuarterlyPlanOutPort {
  persist(quarterId: QuarterId, plan: QuarterlyPlanData): void;
}

export const PERSIST_QUARTERLY_PLAN_OUT_PORT = new InjectionToken<PersistQuarterlyPlanOutPort>('PersistQuarterlyPlanOutPort');
