import { BoardCell } from '../../../shared/domain/board-cell';

export interface BingoCell {
  title: string;
}

export interface BingoGameProgress {
  boardDefinitionId: string;
  boardSignature: string;
  boardSnapshot: BingoCell[];
  cellImages: (string | undefined)[];
  done: boolean[];
  startedAt: string;
}

export function createBoardSignature(cells: readonly { title: string }[]): string {
  return JSON.stringify(cells.map(c => ({ title: c.title })));
}

export class BingoGame {
  private constructor(
    readonly boardDefinitionId: string,
    private readonly _snapshot: readonly BingoCell[],
    private readonly _cellImages: readonly (string | undefined)[],
    private readonly _done: readonly boolean[],
    readonly startedAt: string,
  ) {}

  static empty(): BingoGame {
    return new BingoGame('', [], [], [], new Date().toISOString());
  }

  static fromDefinition(boardDefinitionId: string, cells: readonly { title: string; imageId?: string }[]): BingoGame {
    return new BingoGame(
      boardDefinitionId,
      cells.map(c => ({ title: c.title })),
      cells.map(c => c.imageId),
      new Array(cells.length).fill(false),
      new Date().toISOString(),
    );
  }

  static restore(cells: readonly { title: string }[], saved: BingoGameProgress): BingoGame {
    const signature = createBoardSignature(cells);
    if (saved.boardSignature !== signature) {
      return BingoGame.fromDefinition(saved.boardDefinitionId, cells);
    }
    return new BingoGame(
      saved.boardDefinitionId,
      [...saved.boardSnapshot],
      [...saved.cellImages],
      saved.done.map(Boolean),
      saved.startedAt,
    );
  }

  get projects(): readonly BoardCell[] {
    return this._snapshot.map((cell, i) => ({
      title: cell.title,
      imageId: this._cellImages[i],
    }));
  }

  get done(): readonly boolean[] {
    return this._done;
  }

  get bingoCells(): Set<number> {
    return computeBingoCells(this._done);
  }

  get isEmpty(): boolean {
    return this._snapshot.length === 0;
  }

  toggle(index: number): BingoGame {
    if (!isValidIndex(index, this._done.length)) {
      return new BingoGame(this.boardDefinitionId, this._snapshot, this._cellImages, [...this._done], this.startedAt);
    }
    const next = [...this._done];
    next[index] = !next[index];
    return new BingoGame(this.boardDefinitionId, this._snapshot, this._cellImages, next, this.startedAt);
  }

  resetProgress(): BingoGame {
    return new BingoGame(
      this.boardDefinitionId,
      this._snapshot,
      this._cellImages,
      new Array(this._snapshot.length).fill(false),
      this.startedAt,
    );
  }

  updateCellImage(index: number, imageId: string | undefined): BingoGame {
    if (!isValidIndex(index, this._snapshot.length)) {
      return new BingoGame(this.boardDefinitionId, this._snapshot, [...this._cellImages], this._done, this.startedAt);
    }
    const next = [...this._cellImages];
    next[index] = imageId;
    return new BingoGame(this.boardDefinitionId, this._snapshot, next, this._done, this.startedAt);
  }

  toProgress(): BingoGameProgress {
    return {
      boardDefinitionId: this.boardDefinitionId,
      boardSignature: createBoardSignature(this._snapshot),
      boardSnapshot: [...this._snapshot] as BingoCell[],
      cellImages: [...this._cellImages] as (string | undefined)[],
      done: [...this._done] as boolean[],
      startedAt: this.startedAt,
    };
  }
}

function computeBingoCells(done: readonly boolean[]): Set<number> {
  const size = Math.sqrt(done.length);
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
    if (line.every(cellIndex => done[cellIndex])) {
      line.forEach(cellIndex => result.add(cellIndex));
    }
  }

  return result;
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
