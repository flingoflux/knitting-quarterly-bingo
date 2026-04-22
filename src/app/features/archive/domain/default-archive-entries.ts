import { QuarterId } from '../../../core/domain';
import { ArchiveEntry } from './archive-entry';

export const DEFAULT_ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    quarterId: QuarterId.parse('2026-Q1'),
    startedAt: '2026-01-01T00:00:00.000Z',
    archivedAt: '2026-03-31T18:00:00.000Z',
    completedCount: 11,
    totalCount: 16,
    hasBingo: true,
    completedChallengeNames: ['Socken', 'Cardigan', 'Fair Isle', 'Restesocken'],
    completed: [true, true, false, true, true, true, true, true, false, true, false, false, true, false, true, true],
    bingoCells: [0, 1, 3, 4, 5, 6, 7, 9, 12, 14, 15],
  },
  {
    quarterId: QuarterId.parse('2025-Q4'),
    startedAt: '2025-10-01T00:00:00.000Z',
    archivedAt: '2025-12-31T18:00:00.000Z',
    completedCount: 7,
    totalCount: 16,
    hasBingo: false,
    completedChallengeNames: ['Muetze', 'Shawl', 'Mini-Sweater'],
    completed: [true, false, true, false, false, true, false, true, true, false, false, true, false, false, true, false],
    bingoCells: [],
  },
  {
    quarterId: QuarterId.parse('2025-Q3'),
    startedAt: '2025-07-01T00:00:00.000Z',
    archivedAt: '2025-09-30T18:00:00.000Z',
    completedCount: 13,
    totalCount: 16,
    hasBingo: true,
    completedChallengeNames: ['Top', 'Summer Tee', 'Lace Socks', 'Baby Blanket'],
    completed: [true, true, true, true, true, false, true, true, true, true, false, true, true, true, false, true],
    bingoCells: [0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15],
  },
];