import { InjectionToken } from '@angular/core';
import { QuarterRolloverCursor } from './quarter-lifecycle-state';

export interface QuarterRolloverCursorRepository {
  load(): QuarterRolloverCursor | null;
  save(cursor: QuarterRolloverCursor): void;
  clear(): void;
}

export const QUARTER_ROLLOVER_CURSOR_REPOSITORY = new InjectionToken<QuarterRolloverCursorRepository>(
  'QuarterRolloverCursorRepository',
);
