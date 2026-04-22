import { QuarterId } from '../../../core/domain';

export interface ChallengeProgress {
  name: string;
  planningImageId?: string;
  progressImageId?: string;
  completed: boolean;
}

export interface BingoGameProgress {
  quarterId: string;
  boardSignature: string;
  challenges: ChallengeProgress[];
  startedAt: string;
}

export function createBoardSignature(cells: readonly { name: string }[]): string {
  return JSON.stringify(cells.map(c => ({ name: c.name })));
}

export class BingoGame {
  private constructor(
    readonly quarterId: QuarterId | null,
    private readonly _challenges: readonly ChallengeProgress[],
    readonly startedAt: string,
  ) {}

  static empty(): BingoGame {
    return new BingoGame(null, [], new Date().toISOString());
  }

  static fromDefinition(quarterId: QuarterId | string, cells: readonly { name: string; imageId?: string }[]): BingoGame {
    return new BingoGame(
      QuarterId.from(quarterId),
      cells.map(c => ({
        name: c.name,
        planningImageId: c.imageId,
        progressImageId: undefined,
        completed: false,
      })),
      new Date().toISOString(),
    );
  }

  static restore(cells: readonly { name: string; imageId?: string }[], saved: BingoGameProgress): BingoGame {
    const signature = createBoardSignature(cells);
    if (saved.boardSignature !== signature) {
      return BingoGame.fromDefinition(saved.quarterId, cells);
    }
    return new BingoGame(
      QuarterId.from(saved.quarterId),
      saved.challenges.map((c, i) => ({
        name: c.name,
        planningImageId: c.planningImageId ?? cells[i]?.imageId,
        progressImageId: c.progressImageId,
        completed: Boolean(c.completed),
      })),
      saved.startedAt,
    );
  }

  get challenges(): readonly ChallengeProgress[] {
    return this._challenges;
  }

  get completed(): readonly boolean[] {
    return this._challenges.map(c => c.completed);
  }

  get bingoCells(): Set<number> {
    return computeBingoCells(this._challenges.map(c => c.completed));
  }

  get isEmpty(): boolean {
    return this._challenges.length === 0;
  }

  toggle(index: number): BingoGame {
    if (!isValidIndex(index, this._challenges.length)) {
      return new BingoGame(this.quarterId, [...this._challenges], this.startedAt);
    }
    const next = [...this._challenges];
    next[index] = { ...next[index], completed: !next[index].completed };
    return new BingoGame(this.quarterId, next, this.startedAt);
  }

  resetProgress(): BingoGame {
    return new BingoGame(
      this.quarterId,
      this._challenges.map(c => ({ ...c, completed: false })),
      this.startedAt,
    );
  }

  updateProgressImage(index: number, imageId: string | undefined): BingoGame {
    if (!isValidIndex(index, this._challenges.length)) {
      return new BingoGame(this.quarterId, [...this._challenges], this.startedAt);
    }
    const next = [...this._challenges];
    next[index] = { ...next[index], progressImageId: imageId };
    return new BingoGame(this.quarterId, next, this.startedAt);
  }

  toProgress(): BingoGameProgress {
    if (this.quarterId === null) {
      throw new Error('Cannot persist an empty bingo game without quarter ID');
    }

    return {
      quarterId: this.quarterId.toString(),
      boardSignature: createBoardSignature(this._challenges),
      challenges: [...this._challenges] as ChallengeProgress[],
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
