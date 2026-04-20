import { Challenge } from '../../../shared/domain/challenge';

export interface ChallengeSnapshot {
  name: string;
}

export interface BingoGameProgress {
  boardDefinitionId: string;
  boardSignature: string;
  challenges: ChallengeSnapshot[];
  cellImages: (string | undefined)[];
  completed: boolean[];
  startedAt: string;
}

export function createBoardSignature(cells: readonly { name: string }[]): string {
  return JSON.stringify(cells.map(c => ({ name: c.name })));
}

export class BingoGame {
  private constructor(
    readonly boardDefinitionId: string,
    private readonly _challenges: readonly ChallengeSnapshot[],
    private readonly _cellImages: readonly (string | undefined)[],
    private readonly _completed: readonly boolean[],
    readonly startedAt: string,
  ) {}

  static empty(): BingoGame {
    return new BingoGame('', [], [], [], new Date().toISOString());
  }

  static fromDefinition(boardDefinitionId: string, cells: readonly { name: string; imageId?: string }[]): BingoGame {
    return new BingoGame(
      boardDefinitionId,
      cells.map(c => ({ name: c.name })),
      new Array(cells.length).fill(undefined),
      new Array(cells.length).fill(false),
      new Date().toISOString(),
    );
  }

  static restore(cells: readonly { name: string }[], saved: BingoGameProgress): BingoGame {
    const signature = createBoardSignature(cells);
    if (saved.boardSignature !== signature) {
      return BingoGame.fromDefinition(saved.boardDefinitionId, cells);
    }
    return new BingoGame(
      saved.boardDefinitionId,
      [...saved.challenges],
      [...saved.cellImages],
      saved.completed.map(Boolean),
      saved.startedAt,
    );
  }

  get challenges(): readonly Challenge[] {
    return this._challenges.map((cell, i) => ({
      name: cell.name,
      imageId: this._cellImages[i],
    }));
  }

  get completed(): readonly boolean[] {
    return this._completed;
  }

  get bingoCells(): Set<number> {
    return computeBingoCells(this._completed);
  }

  get isEmpty(): boolean {
    return this._challenges.length === 0;
  }

  toggle(index: number): BingoGame {
    if (!isValidIndex(index, this._completed.length)) {
      return new BingoGame(this.boardDefinitionId, this._challenges, this._cellImages, [...this._completed], this.startedAt);
    }
    const next = [...this._completed];
    next[index] = !next[index];
    return new BingoGame(this.boardDefinitionId, this._challenges, this._cellImages, next, this.startedAt);
  }

  resetProgress(): BingoGame {
    return new BingoGame(
      this.boardDefinitionId,
      this._challenges,
      this._cellImages,
      new Array(this._challenges.length).fill(false),
      this.startedAt,
    );
  }

  updateCellImage(index: number, imageId: string | undefined): BingoGame {
    if (!isValidIndex(index, this._challenges.length)) {
      return new BingoGame(this.boardDefinitionId, this._challenges, [...this._cellImages], this._completed, this.startedAt);
    }
    const next = [...this._cellImages];
    next[index] = imageId;
    return new BingoGame(this.boardDefinitionId, this._challenges, next, this._completed, this.startedAt);
  }

  toProgress(): BingoGameProgress {
    return {
      boardDefinitionId: this.boardDefinitionId,
      boardSignature: createBoardSignature(this._challenges),
      challenges: [...this._challenges] as ChallengeSnapshot[],
      cellImages: [...this._cellImages] as (string | undefined)[],
      completed: [...this._completed] as boolean[],
      startedAt: this.startedAt,
    };
  }
}

function computeBingoCells(completed: readonly boolean[]): Set<number> {
  const size = Math.sqrt(completed.length);
  if (!Number.isInteger(size) || size < 2) {
    return new Set<number>();
  }

  const lines: number[][] = [];

  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }

  for (let c = 0; c < size; c++) {
    const column: number[] = [];
    for (let r = 0; r < size; r++) {
      column.push(r * size + c);
    }
    lines.push(column);
  }

  const diagonalA: number[] = [];
  const diagonalB: number[] = [];
  for (let i = 0; i < size; i++) {
    diagonalA.push(i * size + i);
    diagonalB.push(i * size + (size - 1 - i));
  }
  lines.push(diagonalA, diagonalB);

  const result = new Set<number>();
  for (const line of lines) {
    if (line.every(cellIndex => completed[cellIndex])) {
      line.forEach(cellIndex => result.add(cellIndex));
    }
  }

  return result;
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
