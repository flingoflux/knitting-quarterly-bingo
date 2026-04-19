import { Injectable, computed, signal } from '@angular/core';
import { BoardCell } from '../../shared/domain/board-cell';
import { DEFAULT_BOARD_PROJECTS } from '../../shared/domain/default-board-projects';
import { BoardRepositoryService, PersistedBoardState } from './board-repository.service';

interface BoardState {
  projects: BoardCell[];
  done: boolean[];
}

@Injectable({ providedIn: 'root' })
export class BoardStoreService {
  private readonly state = signal<BoardState>({ projects: [], done: [] });

  readonly projects = computed(() => this.state().projects);
  readonly done = computed(() => this.state().done);
  readonly bingoCells = computed(() => this.computeBingoCells(this.done()));
  readonly hasProjects = computed(() => this.projects().length > 0);

  constructor(private readonly repository: BoardRepositoryService) {
    const persisted = this.repository.load();
    if (persisted !== null) {
      this.state.set(this.normalize(persisted));
    }
  }

  initializeDefaultsIfEmpty(): void {
    if (this.hasProjects()) {
      return;
    }

    this.setProjects([...DEFAULT_BOARD_PROJECTS]);
  }

  resetToDefaults(): void {
    this.setProjects([...DEFAULT_BOARD_PROJECTS]);
  }

  setProjects(projects: BoardCell[]): void {
    const normalizedProjects = [...projects];
    this.state.set({
      projects: normalizedProjects,
      done: new Array(normalizedProjects.length).fill(false),
    });
    this.persist();
  }

  swapProjects(startIndex: number, targetIndex: number): void {
    const projects = [...this.projects()];
    if (!this.isValidIndex(startIndex, projects.length) || !this.isValidIndex(targetIndex, projects.length)) {
      return;
    }

    [projects[startIndex], projects[targetIndex]] = [projects[targetIndex], projects[startIndex]];
    this.state.update(current => ({ ...current, projects }));
    this.persist();
  }

  toggle(index: number): void {
    const done = [...this.done()];
    if (!this.isValidIndex(index, done.length)) {
      return;
    }

    done[index] = !done[index];
    this.state.update(current => ({ ...current, done }));
    this.persist();
  }

  private persist(): void {
    this.repository.save({
      projects: this.projects(),
      done: this.done(),
    });
  }

  private normalize(state: PersistedBoardState): BoardState {
    const projects = [...state.projects];
    const done = projects.map((_, index) => Boolean(state.done[index]));
    return { projects, done };
  }

  private computeBingoCells(done: boolean[]): Set<number> {
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

  private isValidIndex(index: number, length: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < length;
  }
}
