import { describe, expect, it, vi } from 'vitest';
import { createArchiveEntry, sortArchiveEntriesNewestFirst } from './archive-entry';

describe('createArchiveEntry', () => {
  it('berechnet completedCount und completedChallengeNames', () => {
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      archivedAt: '2026-04-01T00:00:00.000Z',
      game: {
        boardDefinitionId: 'board-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: 'A', completed: true },
          { name: 'B', completed: false },
          { name: 'C', completed: true },
          { name: 'D', completed: false },
        ],
      },
    });

    expect(entry.completedCount).toBe(2);
    expect(entry.totalCount).toBe(4);
    expect(entry.completedChallengeNames).toEqual(['A', 'C']);
  });

  it('setzt hasBingo auf true bei kompletter Reihe', () => {
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      game: {
        boardDefinitionId: 'board-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: '1', completed: true },
          { name: '2', completed: true },
          { name: '3', completed: true },
          { name: '4', completed: true },
        ],
      },
    });

    expect(entry.hasBingo).toBe(true);
  });

  it('setzt hasBingo auf false wenn keine komplette Linie vorliegt', () => {
    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      game: {
        boardDefinitionId: 'board-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: '1', completed: true },
          { name: '2', completed: false },
          { name: '3', completed: false },
          { name: '4', completed: false },
        ],
      },
    });

    expect(entry.hasBingo).toBe(false);
  });

  it('verwendet provided archivedAt und erzeugt eine id', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'archive-id-1' });

    const entry = createArchiveEntry({
      quarterId: '2026-Q1',
      archivedAt: '2026-04-01T00:00:00.000Z',
      game: {
        boardDefinitionId: 'board-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        challenges: [
          { name: 'A', completed: false },
          { name: 'B', completed: false },
          { name: 'C', completed: false },
          { name: 'D', completed: false },
        ],
      },
    });

    expect(entry.id).toBe('archive-id-1');
    expect(entry.archivedAt).toBe('2026-04-01T00:00:00.000Z');
  });
});

describe('sortArchiveEntriesNewestFirst', () => {
  it('sortiert nach archivedAt absteigend', () => {
    const sorted = sortArchiveEntriesNewestFirst([
      {
        id: 'a',
        quarterId: '2025-Q4',
        boardDefinitionId: 'b1',
        startedAt: '2025-10-01T00:00:00.000Z',
        archivedAt: '2026-01-01T00:00:00.000Z',
        completedCount: 4,
        totalCount: 16,
        hasBingo: false,
        completedChallengeNames: [],
      },
      {
        id: 'b',
        quarterId: '2026-Q1',
        boardDefinitionId: 'b2',
        startedAt: '2026-01-01T00:00:00.000Z',
        archivedAt: '2026-04-01T00:00:00.000Z',
        completedCount: 8,
        totalCount: 16,
        hasBingo: true,
        completedChallengeNames: [],
      },
    ]);

    expect(sorted.map(entry => entry.id)).toEqual(['b', 'a']);
  });
});
