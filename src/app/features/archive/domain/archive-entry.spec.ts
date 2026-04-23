import { describe, expect, it, vi } from 'vitest';
import { QuarterId } from '../../../core/domain';
import { createArchiveEntry, sortArchiveEntriesNewestFirst } from './archive-entry';

describe('createArchiveEntry', () => {
  it('should berechnet completedCount und completedChallengeNames', () => {
    // given
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      archivedAt: '2026-04-01T00:00:00.000Z',
      game: {
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: 'A', completed: true },
          { name: 'B', completed: false },
          { name: 'C', completed: true },
          { name: 'D', completed: false },
        ],
      },
    // when
    });

    // then
    expect(entry.completedCount).toBe(2);
    expect(entry.totalCount).toBe(4);
    expect(entry.completedChallengeNames).toEqual(['A', 'C']);
  });

  it('should setzt hasBingo auf true bei kompletter Reihe', () => {
    // given
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      game: {
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: '1', completed: true },
          { name: '2', completed: true },
          { name: '3', completed: true },
          { name: '4', completed: true },
        ],
      },
    // when
    });

    // then
    expect(entry.hasBingo).toBe(true);
  });

  it('should setzt hasBingo auf false wenn keine komplette Linie vorliegt', () => {
    // given
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      game: {
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: '1', completed: true },
          { name: '2', completed: false },
          { name: '3', completed: false },
          { name: '4', completed: false },
        ],
      },
    // when
    });

    // then
    expect(entry.hasBingo).toBe(false);
  });

  it('should verwendet provided archivedAt', () => {
    // given
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      archivedAt: '2026-04-01T00:00:00.000Z',
      game: {
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: 'A', completed: false },
          { name: 'B', completed: false },
          { name: 'C', completed: false },
          { name: 'D', completed: false },
        ],
      },
    // when
    });

    // then
    expect(entry.archivedAt).toBe('2026-04-01T00:00:00.000Z');
  });
});

describe('sortArchiveEntriesNewestFirst', () => {
  it('should sortiert nach archivedAt absteigend', () => {
    // given
    const sorted = sortArchiveEntriesNewestFirst([
      {
        quarterId: QuarterId.parse('2025-Q4'),
        startedAt: '2025-10-01T00:00:00.000Z',
        archivedAt: '2026-01-01T00:00:00.000Z',
        completedCount: 4,
        totalCount: 16,
        hasBingo: false,
        completedChallengeNames: [],
        completed: [],
        bingoCells: [],
      },
      {
        quarterId: QuarterId.parse('2026-Q1'),
        startedAt: '2026-01-01T00:00:00.000Z',
        archivedAt: '2026-04-01T00:00:00.000Z',
        completedCount: 8,
        totalCount: 16,
        hasBingo: true,
        completedChallengeNames: [],
        completed: [],
        bingoCells: [],
      },
    // when
    ]);

    // then
    expect(sorted.map(entry => entry.quarterId.toString())).toEqual(['2026-Q1', '2025-Q4']);
  });
});
