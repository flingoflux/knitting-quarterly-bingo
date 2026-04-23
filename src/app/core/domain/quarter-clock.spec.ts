import { describe, expect, it } from 'vitest';
import { QuarterClock } from './quarter-clock';

describe('QuarterClock', () => {
  it('should return Q1 when date is in the first quarter', () => {
    // given
    const clock = new QuarterClock();

    // when + then
    expect(clock.getQuarterId(new Date('2026-01-15T12:00:00.000Z'))).toBe('2026-Q1');
  });

  it('should resolve quarter boundaries correctly when date is at edge days', () => {
    // given
    const clock = new QuarterClock();

    // when + then
    expect(clock.getQuarterId(new Date('2026-03-31T12:00:00.000Z'))).toBe('2026-Q1');
    expect(clock.getQuarterId(new Date('2026-04-01T12:00:00.000Z'))).toBe('2026-Q2');
  });

  it('should report rollover when previous and current quarters differ', () => {
    // given
    const clock = new QuarterClock();

    // when + then
    expect(clock.isRolloverDue('2026-Q1', '2026-Q2')).toBe(true);
    expect(clock.isRolloverDue('2026-Q2', '2026-Q2')).toBe(false);
  });

  it('should return next quarter when calculating from a given date', () => {
    // given
    const clock = new QuarterClock();

    // when + then
    expect(clock.getNextQuarterId(new Date('2026-01-15T12:00:00.000Z'))).toBe('2026-Q2');
    expect(clock.getNextQuarterId(new Date('2026-04-21T12:00:00.000Z'))).toBe('2026-Q3');
    expect(clock.getNextQuarterId(new Date('2026-10-15T12:00:00.000Z'))).toBe('2027-Q1');
    expect(clock.getNextQuarterId(new Date('2026-12-31T12:00:00.000Z'))).toBe('2027-Q1');
  });
});
