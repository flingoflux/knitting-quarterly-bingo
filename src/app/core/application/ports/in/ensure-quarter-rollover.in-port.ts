import { InjectionToken } from '@angular/core';

export interface EnsureQuarterRolloverInPort {
  persistQuarterRollover(now?: Date): void;
}

export const ENSURE_QUARTER_ROLLOVER_IN_PORT = new InjectionToken<EnsureQuarterRolloverInPort>('EnsureQuarterRolloverInPort');
