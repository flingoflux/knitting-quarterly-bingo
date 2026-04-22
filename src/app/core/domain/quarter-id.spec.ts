import { describe, expect, it } from 'vitest';
import { QuarterId } from './quarter-id';

describe('QuarterId', () => {
  it('parst gueltige Quarter IDs', () => {
    expect(QuarterId.parse('2026-Q2').toString()).toBe('2026-Q2');
  });

  it('lehnt invalide Quarter IDs ab', () => {
    expect(() => QuarterId.parse('2026-Q8')).toThrow('Invalid quarter ID');
    expect(() => QuarterId.parse('Q2-2026')).toThrow('Invalid quarter ID');
  });

  it('berechnet next und previous korrekt', () => {
    expect(QuarterId.parse('2026-Q4').next().toString()).toBe('2027-Q1');
    expect(QuarterId.parse('2026-Q1').previous().toString()).toBe('2025-Q4');
  });

  it('vergleicht Quarter IDs korrekt', () => {
    const q1 = QuarterId.parse('2026-Q1');
    const q2 = QuarterId.parse('2026-Q2');

    expect(q1.isBefore(q2)).toBe(true);
    expect(q2.isAfter(q1)).toBe(true);
    expect(q1.equals(QuarterId.parse('2026-Q1'))).toBe(true);
  });
});