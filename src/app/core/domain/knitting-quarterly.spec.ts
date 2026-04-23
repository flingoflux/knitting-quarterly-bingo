import { describe, expect, it } from 'vitest';
import { KnittingQuarterly } from './knitting-quarterly';

describe('KnittingQuarterly', () => {
  describe('classifyPhase', () => {
    it('should klassifiziert vergangene Quartale als past', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q1', '2026-Q2')).toBe('past');
    });

    it('should klassifiziert das aktuelle Quartal als current', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q2', '2026-Q2')).toBe('current');
    });

    it('should klassifiziert zukünftige Quartale als future', () => {
      // given
      // when + then
      expect(KnittingQuarterly.classifyPhase('2026-Q3', '2026-Q2')).toBe('future');
    });
  });

  describe('abgeleitete Aktionen aus der Phase', () => {
    it('should aktuelles Quartal ist automatisch spielbar', () => {
      // given
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
      // when
      });

      // then
      expect(quarterly.phaseAt('2026-Q2')).toBe('current');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(false);
    });

    it('should zukuenftiges Quartal ist editierbare Vorschau', () => {
      // given
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q3',
      // when
      });

      // then
      expect(quarterly.phaseAt('2026-Q2')).toBe('future');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(true);
    });

    it('should vergangenes Quartal erfordert Archivansicht', () => {
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
