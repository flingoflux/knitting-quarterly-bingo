import { InjectionToken } from '@angular/core';

export interface ShowQuarterlyProgressInPort {
  readonly hasBingoThisQuarter: boolean;
  readonly daysUntilNextQuarter: number;
}

export const SHOW_QUARTERLY_PROGRESS_IN_PORT = new InjectionToken<ShowQuarterlyProgressInPort>('ShowQuarterlyProgressInPort');
