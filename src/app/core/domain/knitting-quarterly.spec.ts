import { describe, expect, it } from 'vitest';
import { KnittingQuarterly } from './knitting-quarterly';

describe('KnittingQuarterly', () => {
  describe('classifyPhase', () => {
    it('should classify a quarter as past when it is before the current quarter', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q1', '2026-Q2')).toBe('past');
    });

    it('should classify a quarter as current when it matches the current quarter', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q2', '2026-Q2')).toBe('current');
    });

    it('should classify a quarter as future when it is after the current quarter', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q3', '2026-Q2')).toBe('future');
    });
  });

  describe('abgeleitete Aktionen aus der Phase', () => {
    it('should mark a quarter as playable when it is current', () => {
      // given
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
      // when
      });

      // then
      expect(quarterly.phaseAt('2026-Q2')).toBe('current');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(false);
    });

    it('should mark a quarter as future preview when it is in the future', () => {
      // given
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q3',
      // when
      });

      // then
      expect(quarterly.phaseAt('2026-Q2')).toBe('future');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(true);
    });

    it('should require archive view when the quarter is in the past', () => {
      // given
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q1',
      // when
      });

      // then
      expect(quarterly.phaseAt('2026-Q2')).toBe('past');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(false);
    });
  });
});
