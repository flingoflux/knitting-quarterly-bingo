import { describe, expect, it } from 'vitest';
import { QuarterClock } from './quarter-clock';

describe('QuarterClock', () => {
  it('berechnet das erste Quartal korrekt', () => {
    const clock = new QuarterClock();

    expect(clock.getQuarterId(new Date('2026-01-15T12:00:00.000Z'))).toBe('2026-Q1');
  });

  it('berechnet Quartalsgrenzen korrekt', () => {
    const clock = new QuarterClock();

    expect(clock.getQuarterId(new Date('2026-03-31T12:00:00.000Z'))).toBe('2026-Q1');
    expect(clock.getQuarterId(new Date('2026-04-01T12:00:00.000Z'))).toBe('2026-Q2');
  });

  it('erkennt einen Quartalswechsel', () => {
    const clock = new QuarterClock();

    expect(clock.isRolloverDue('2026-Q1', '2026-Q2')).toBe(true);
    expect(clock.isRolloverDue('2026-Q2', '2026-Q2')).toBe(false);
  });
});
