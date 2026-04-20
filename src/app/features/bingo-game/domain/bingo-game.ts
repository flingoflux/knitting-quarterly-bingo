import { BoardCell } from '../../../shared/domain/board-cell';

export interface BingoGameProgress {
  boardSignature: string;
  done: boolean[];
}

export function createBoardSignature(projects: readonly BoardCell[]): string {
  return JSON.stringify(projects.map(project => ({
    title: project.title,
  })));
}

export class BingoGame {
  private constructor(
    private readonly _projects: readonly BoardCell[],
    private readonly _done: readonly boolean[],
  ) {}

  static empty(): BingoGame {
    return new BingoGame([], []);
  }

  static fromDefinition(projects: readonly BoardCell[]): BingoGame {
    return new BingoGame([...projects], new Array(projects.length).fill(false));
  }

  static restore(projects: readonly BoardCell[], saved: BingoGameProgress): BingoGame {
    const signature = createBoardSignature(projects);
    if (saved.boardSignature !== signature) {
      return BingoGame.fromDefinition(projects);
    }
    const done = Array.from({ length: projects.length }, (_, i) => Boolean(saved.done[i]));
    return new BingoGame([...projects], done);
  }

  get projects(): readonly BoardCell[] {
    return this._projects;
  }

  get done(): readonly boolean[] {
    return this._done;
  }

  get bingoCells(): Set<number> {
    return computeBingoCells(this._done);
  }

  get isEmpty(): boolean {
    return this._projects.length === 0;
  }

  toggle(index: number): BingoGame {
    if (!isValidIndex(index, this._done.length)) {
      return new BingoGame(this._projects, [...this._done]);
    }
    const next = [...this._done];
    next[index] = !next[index];
    return new BingoGame(this._projects, next);
  }

  resetProgress(): BingoGame {
    return new BingoGame(this._projects, new Array(this._projects.length).fill(false));
  }

  updateProjects(projects: readonly BoardCell[]): BingoGame {
    const done = Array.from({ length: projects.length }, (_, i) => Boolean(this._done[i]));
    return new BingoGame([...projects], done);
  }

  toProgress(): BingoGameProgress {
    return {
      boardSignature: createBoardSignature(this._projects),
      done: [...this._done] as boolean[],
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
