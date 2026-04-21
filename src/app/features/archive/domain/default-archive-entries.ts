import { ArchiveEntry } from './archive-entry';

export const DEFAULT_ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    id: 'prototype-2026-q1',
    quarterId: '2026-Q1',
    boardDefinitionId: 'prototype-board-2026-q1',
    startedAt: '2026-01-01T00:00:00.000Z',
    archivedAt: '2026-03-31T18:00:00.000Z',
    completedCount: 11,
    totalCount: 16,
    hasBingo: true,
    completedChallengeNames: ['Socken', 'Cardigan', 'Fair Isle', 'Restesocken'],
  },
  {
    id: 'prototype-2025-q4',
    quarterId: '2025-Q4',
    boardDefinitionId: 'prototype-board-2025-q4',
    startedAt: '2025-10-01T00:00:00.000Z',
    archivedAt: '2025-12-31T18:00:00.000Z',
    completedCount: 7,
    totalCount: 16,
    hasBingo: false,
    completedChallengeNames: ['Muetze', 'Shawl', 'Mini-Sweater'],
  },
  {
    id: 'prototype-2025-q3',
    quarterId: '2025-Q3',
    boardDefinitionId: 'prototype-board-2025-q3',
    startedAt: '2025-07-01T00:00:00.000Z',
    archivedAt: '2025-09-30T18:00:00.000Z',
    completedCount: 13,
    totalCount: 16,
    hasBingo: true,
    completedChallengeNames: ['Top', 'Summer Tee', 'Lace Socks', 'Baby Blanket'],
  },
];