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

  describe('abgeleitete Aktionen aus der Phase', () => {
    it('aktuelles Quartal ist automatisch spielbar', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
      });

      expect(quarterly.phaseAt('2026-Q2')).toBe('current');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(false);
    });

    it('zukuenftiges Quartal ist editierbare Vorschau', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q3',
      });

      expect(quarterly.phaseAt('2026-Q2')).toBe('future');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(true);
    });

    it('vergangenes Quartal erfordert Archivansicht', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q1',
      });

      expect(quarterly.phaseAt('2026-Q2')).toBe('past');
      expect(quarterly.isFuturePreview('2026-Q2')).toBe(false);
    });
  });
});
