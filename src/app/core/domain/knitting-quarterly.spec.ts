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

  describe('modeAt', () => {
    it('liefert fuer das aktuelle Quartal edit oder play anhand lifecycle state', () => {
      const editQuarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'edit',
      });
      const playQuarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'play',
      });

      expect(editQuarterly.modeAt('2026-Q2')).toBe('edit');
      expect(playQuarterly.modeAt('2026-Q2')).toBe('play');
    });

    it('liefert fuer vergangene Quartale immer archive', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q1',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'play',
      });

      expect(quarterly.modeAt('2026-Q2')).toBe('archive');
    });

    it('liefert fuer zukuenftige Quartale immer edit', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q3',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'play',
      });

      expect(quarterly.modeAt('2026-Q2')).toBe('edit');
    });
  });

  describe('lifecycle transitions', () => {
    it('erlaubt edit -> play ueber startGame', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'edit',
      });

      const started = quarterly.startGame('2026-Q2');

      expect(started.lifecycleState).toBe('play');
      expect(started.modeAt('2026-Q2')).toBe('play');
    });

    it('erlaubt play -> archive ueber archive', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'play',
      });

      const archived = quarterly.archive('2026-Q2');

      expect(archived.lifecycleState).toBe('archive');
      expect(archived.modeAt('2026-Q2')).toBe('archive');
    });

    it('verbietet archive -> play', () => {
      const quarterly = KnittingQuarterly.create({
        quarterId: '2026-Q2',
        boardDefinitionId: 'plan-id',
        lifecycleState: 'archive',
      });

      expect(() => quarterly.startGame('2026-Q2')).toThrow('cannot transition');
    });
  });
});
