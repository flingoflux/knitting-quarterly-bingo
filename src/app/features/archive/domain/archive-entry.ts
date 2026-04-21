export interface ArchiveChallengeSnapshot {
  name: string;
  completed: boolean;
}

export interface ArchiveEntry {
  id: string;
  quarterId: string;
  boardDefinitionId: string;
  startedAt: string;
  archivedAt: string;
  completedCount: number;
  totalCount: number;
  hasBingo: boolean;
  completedChallengeNames: string[];
}

export interface ArchiveSourceGame {
  boardDefinitionId: string;
  startedAt: string;
  challenges: readonly ArchiveChallengeSnapshot[];
}

export function createArchiveEntry(params: {
  quarterId: string;
  archivedAt?: string;
  game: ArchiveSourceGame;
}): ArchiveEntry {
  const completedChallengeNames = params.game.challenges
    .filter(challenge => challenge.completed)
    .map(challenge => challenge.name);

  return {
    id: crypto.randomUUID(),
    quarterId: params.quarterId,
    boardDefinitionId: params.game.boardDefinitionId,
    startedAt: params.game.startedAt,
    archivedAt: params.archivedAt ?? new Date().toISOString(),
    completedCount: completedChallengeNames.length,
    totalCount: params.game.challenges.length,
    hasBingo: hasBingoLine(params.game.challenges.map(challenge => challenge.completed)),
    completedChallengeNames,
  };
}

export function sortArchiveEntriesNewestFirst(entries: readonly ArchiveEntry[]): ArchiveEntry[] {
  return [...entries].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
}

export function isArchiveEntry(value: unknown): value is ArchiveEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ArchiveEntry>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.quarterId === 'string' &&
    typeof candidate.boardDefinitionId === 'string' &&
    typeof candidate.startedAt === 'string' &&
    typeof candidate.archivedAt === 'string' &&
    typeof candidate.completedCount === 'number' &&
    typeof candidate.totalCount === 'number' &&
    typeof candidate.hasBingo === 'boolean' &&
    Array.isArray(candidate.completedChallengeNames) &&
    candidate.completedChallengeNames.every(name => typeof name === 'string')
  );
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
