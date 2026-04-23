import { describe, expect, it } from 'vitest';
import { QuarterId } from './quarter-id';

describe('QuarterId', () => {
  it('should parse quarter ids when format is valid', () => {
    // given
    // when + then
    expect(QuarterId.parse('2026-Q2').toString()).toBe('2026-Q2');
  });

  it('should throw an error when quarter id format is invalid', () => {
    // given
    // when + then
    expect(() => QuarterId.parse('2026-Q8')).toThrow('Invalid quarter ID');
    expect(() => QuarterId.parse('Q2-2026')).toThrow('Invalid quarter ID');
  });

  it('should compute next and previous quarter ids for boundary quarters', () => {
    // given
    // when + then
    expect(QuarterId.parse('2026-Q4').next().toString()).toBe('2027-Q1');
    expect(QuarterId.parse('2026-Q1').previous().toString()).toBe('2025-Q4');
  });

  it('should compare quarter ids when ordering and equality are checked', () => {
    // given
    const q1 = QuarterId.parse('2026-Q1');
    const q2 = QuarterId.parse('2026-Q2');

    // when + then
    expect(q1.isBefore(q2)).toBe(true);
    expect(q2.isAfter(q1)).toBe(true);
    expect(q1.equals(QuarterId.parse('2026-Q1'))).toBe(true);
  });
});