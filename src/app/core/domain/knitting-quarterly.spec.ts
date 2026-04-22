import { describe, expect, it } from 'vitest';
import { KnittingQuarterly } from './knitting-quarterly';

describe('KnittingQuarterly', () => {
  describe('classifyPhase', () => {
    it('klassifiziert vergangene Quartale als past', () => {
      expect(KnittingQuarterly.classifyPhase('2026-Q1', '2026-Q2')).toBe('past');
    });

    it('klassifiziert das aktuelle Quartal als current', () => {
      expect(KnittingQuarterly.classifyPhase('2026-Q2', '2026-Q2')).toBe('current');
    });

    it('klassifiziert zukünftige Quartale als future', () => {
      expect(KnittingQuarterly.classifyPhase('2026-Q3', '2026-Q2')).toBe('future');
    });
  });
});
