import { BoardCell } from '../../../shared/domain/board-cell';

export interface BingoGameProgress {
  boardSignature: string;
  done: boolean[];
}

export function createBoardSignature(projects: BoardCell[]): string {
  return JSON.stringify(projects.map(project => ({
    title: project.title,
  })));
}

export function createEmptyDone(length: number): boolean[] {
  return new Array(length).fill(false);
}

export function normalizeDone(done: boolean[], length: number): boolean[] {
  return Array.from({ length }, (_, index) => Boolean(done[index]));
}

export function toggleDone(done: boolean[], index: number): boolean[] {
  if (!isValidIndex(index, done.length)) {
    return [...done];
  }

  const next = [...done];
  next[index] = !next[index];
  return next;
}

export function computeBingoCells(done: boolean[]): Set<number> {
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
