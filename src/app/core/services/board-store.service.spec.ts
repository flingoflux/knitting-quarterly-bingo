import { describe, expect, it } from 'vitest';
import { BoardStoreService } from './board-store.service';
import { BoardRepositoryService, PersistedBoardState } from './board-repository.service';
import { BoardCell } from '../../shared/domain/board-cell';
import { DEFAULT_BOARD_PROJECTS } from '../../shared/domain/default-board-projects';

class MockBoardRepository {
  loadedState: PersistedBoardState | null = null;
  lastSavedState: PersistedBoardState | null = null;

  load(): PersistedBoardState | null {
    return this.loadedState;
  }

  save(state: PersistedBoardState): void {
    this.lastSavedState = {
      projects: [...state.projects],
      done: [...state.done],
    };
    this.loadedState = this.lastSavedState;
  }
}

function createProjects(length = 16): BoardCell[] {
  return Array.from({ length }, (_, index) => ({
    title: `P${index}`,
    cat: 'Cat',
    catKey: 'cat',
  }));
}

function createStore(repository: MockBoardRepository): BoardStoreService {
  return new BoardStoreService(repository as unknown as BoardRepositoryService);
}

describe('BoardStoreService', () => {
  it('startet leer ohne persistierten Zustand', () => {
    const repository = new MockBoardRepository();
    const store = createStore(repository);

    expect(store.hasProjects()).toBe(false);
    expect(store.projects()).toEqual([]);
    expect(store.done()).toEqual([]);
  });

  it('initialisiert Default-Board und persistiert es', () => {
    const repository = new MockBoardRepository();
    const store = createStore(repository);

    store.initializeDefaultsIfEmpty();

    expect(store.projects()).toEqual(DEFAULT_BOARD_PROJECTS);
    expect(store.done()).toEqual(new Array(DEFAULT_BOARD_PROJECTS.length).fill(false));
    expect(repository.lastSavedState?.projects).toEqual(DEFAULT_BOARD_PROJECTS);
  });

  it('setzt Projekte und setzt done-Status passend zur Laenge zurueck', () => {
    const repository = new MockBoardRepository();
    const store = createStore(repository);
    const projects = createProjects(9);

    store.setProjects(projects);

    expect(store.projects()).toEqual(projects);
    expect(store.done()).toEqual(new Array(9).fill(false));
    expect(repository.lastSavedState?.done).toEqual(new Array(9).fill(false));
  });

  it('persistiert Toggle und berechnet Bingo-Zellen', () => {
    const repository = new MockBoardRepository();
    const store = createStore(repository);
    store.setProjects(createProjects(16));

    [0, 1, 2, 3].forEach(index => store.toggle(index));

    expect(store.done().slice(0, 4)).toEqual([true, true, true, true]);
    expect(store.bingoCells()).toEqual(new Set([0, 1, 2, 3]));
    expect(repository.lastSavedState?.done.slice(0, 4)).toEqual([true, true, true, true]);
  });

  it('laedt persistierten Zustand beim Neustart (Flow-Test)', () => {
    const repository = new MockBoardRepository();
    const firstStore = createStore(repository);
    firstStore.setProjects(createProjects(4));
    firstStore.toggle(1);

    const secondStore = createStore(repository);

    expect(secondStore.projects().length).toBe(4);
    expect(secondStore.done()).toEqual([false, true, false, false]);
  });
});
