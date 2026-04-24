import { InjectionToken } from '@angular/core';

export interface StartBingoFromPlanInPort {
  startBingoFromPlan(sourcePlanQuarterId: string): boolean;
}

export const START_BINGO_FROM_PLAN_IN_PORT = new InjectionToken<StartBingoFromPlanInPort>('StartBingoFromPlanInPort');
