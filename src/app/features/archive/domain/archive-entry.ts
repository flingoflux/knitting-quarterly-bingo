import { QuarterId } from '../../../core/domain';

export interface ArchiveChallengeSnapshot {
  name: string;
  completed: boolean;
}

export interface ArchiveEntry {
  quarterId: QuarterId;
  startedAt: string;
  archivedAt: string;
  completedCount: number;
  totalCount: number;
  hasBingo: boolean;
  completedChallengeNames: string[];
  completed: boolean[];
  bingoCells: number[];
}

export interface PersistedArchiveEntry extends Omit<ArchiveEntry, 'quarterId'> {
  quarterId: string;
}

export interface ArchiveSourceGame {
  startedAt: string;
  challenges: readonly ArchiveChallengeSnapshot[];
}

export function createArchiveEntry(params: {
  quarterId: QuarterId | string;
  archivedAt?: string;
  game: ArchiveSourceGame;
}): ArchiveEntry {
  const completedChallengeNames = params.game.challenges
    .filter(challenge => challenge.completed)
    .map(challenge => challenge.name);

  const completed = params.game.challenges.map(challenge => challenge.completed);
  const bingoCells = calculateBingoCells(completed);

  return {
    quarterId: QuarterId.from(params.quarterId),
    startedAt: params.game.startedAt,
    archivedAt: params.archivedAt ?? new Date().toISOString(),
    completedCount: completedChallengeNames.length,
    totalCount: params.game.challenges.length,
    hasBingo: hasBingoLine(completed),
    completedChallengeNames,
    completed,
    bingoCells,
  };
}

export function sortArchiveEntriesNewestFirst(entries: readonly ArchiveEntry[]): ArchiveEntry[] {
  return [...entries].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
}

export function toPersistedArchiveEntry(entry: ArchiveEntry): PersistedArchiveEntry {
  return {
    ...entry,
    quarterId: entry.quarterId.toString(),
  };
}

export function restoreArchiveEntry(value: unknown): ArchiveEntry | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Partial<PersistedArchiveEntry>;
  if (!(
    typeof candidate.quarterId === 'string' &&
    typeof candidate.startedAt === 'string' &&
    typeof candidate.archivedAt === 'string' &&
    typeof candidate.completedCount === 'number' &&
    typeof candidate.totalCount === 'number' &&
    typeof candidate.hasBingo === 'boolean' &&
    Array.isArray(candidate.completedChallengeNames) &&
    candidate.completedChallengeNames.every(name => typeof name === 'string') &&
    Array.isArray(candidate.completed) &&
    candidate.completed.every(c => typeof c === 'boolean') &&
    Array.isArray(candidate.bingoCells) &&
    candidate.bingoCells.every(c => typeof c === 'number')
  )) {
    return null;
  }

  const quarterId = QuarterId.tryParse(candidate.quarterId);
  if (quarterId === null) {
    return null;
  }

  const validated = candidate as PersistedArchiveEntry;
  return {
    ...validated,
    quarterId,
  };
}

function hasBingoLine(completed: readonly boolean[]): boolean {
  const size = Math.sqrt(completed.length);
  if (!Number.isInteger(size) || size < 2) {
    return false;
  }

  for (let r = 0; r < size; r++) {
    let rowComplete = true;
    for (let c = 0; c < size; c++) {
      rowComplete = rowComplete && completed[r * size + c];
    }
    if (rowComplete) {
      return true;
    }
  }

  for (let c = 0; c < size; c++) {
    let columnComplete = true;
    for (let r = 0; r < size; r++) {
      columnComplete = columnComplete && completed[r * size + c];
    }
    if (columnComplete) {
      return true;
    }
  }

  let diagonalAComplete = true;
  let diagonalBComplete = true;
  for (let i = 0; i < size; i++) {
    diagonalAComplete = diagonalAComplete && completed[i * size + i];
    diagonalBComplete = diagonalBComplete && completed[i * size + (size - 1 - i)];
  }

  return diagonalAComplete || diagonalBComplete;
}

function calculateBingoCells(completed: readonly boolean[]): number[] {
  const size = Math.sqrt(completed.length);
  if (!Number.isInteger(size) || size < 2) {
    return [];
  }

  const bingoCells = new Set<number>();

  // Check rows
  for (let r = 0; r < size; r++) {
    let rowComplete = true;
    for (let c = 0; c < size; c++) {
      rowComplete = rowComplete && completed[r * size + c];
    }
    if (rowComplete) {
      for (let c = 0; c < size; c++) {
        bingoCells.add(r * size + c);
      }
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    let columnComplete = true;
    for (let r = 0; r < size; r++) {
      columnComplete = columnComplete && completed[r * size + c];
    }
    if (columnComplete) {
      for (let r = 0; r < size; r++) {
        bingoCells.add(r * size + c);
      }
    }
  }

  // Check diagonals
  let diagonalAComplete = true;
  let diagonalBComplete = true;
  for (let i = 0; i < size; i++) {
    diagonalAComplete = diagonalAComplete && completed[i * size + i];
    diagonalBComplete = diagonalBComplete && completed[i * size + (size - 1 - i)];
  }
  if (diagonalAComplete) {
    for (let i = 0; i < size; i++) {
      bingoCells.add(i * size + i);
    }
  }
  if (diagonalBComplete) {
    for (let i = 0; i < size; i++) {
      bingoCells.add(i * size + (size - 1 - i));
    }
  }

  return Array.from(bingoCells);
}
