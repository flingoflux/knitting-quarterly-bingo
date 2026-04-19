import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { PersistedBoardDefinition } from '../../edit-board/state/board-definition-repository.service';
import { BOARD_DEFINITION_READER } from '../../../shared/ports/board-definition-reader';
import { PlayBingoStateService } from './play-bingo-state.service';
import { BingoGameRepositoryService } from './bingo-game-repository.service';
import { BingoGameProgress, createBoardSignature } from '../domain/bingo-game';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedBoardDefinition | null = null;

  load(): PersistedBoardDefinition | null {
    return this.loadedDefinition;
  }
}

class MockBingoGameRepository {
  loadedProgress: BingoGameProgress | null = null;
  lastSavedProgress: BingoGameProgress | null = null;

  load(): BingoGameProgress | null {
    return this.loadedProgress;
  }

  save(progress: BingoGameProgress): void {
    this.lastSavedProgress = {
      boardSignature: progress.boardSignature,
      done: [...progress.done],
    };
    this.loadedProgress = this.lastSavedProgress;
  }
}

function createProjects(length = 16): BoardCell[] {
  return Array.from({ length }, (_, index) => ({
    title: `P${index}`,
    cat: 'Cat',
    catKey: 'cat',
  }));
}

function createState(
  boardDefinitionRepository: MockBoardDefinitionRepository,
  bingoGameRepository: MockBingoGameRepository,
): PlayBingoStateService {
  const injector = Injector.create({
    providers: [
      { provide: BOARD_DEFINITION_READER, useValue: boardDefinitionRepository },
      { provide: BingoGameRepositoryService, useValue: bingoGameRepository },
    ],
  });
  return runInInjectionContext(injector, () => new PlayBingoStateService());
}

describe('PlayBingoStateService', () => {
  it('hat kein spielbares Board ohne Definition', () => {
    const boardDefinitionRepository = new MockBoardDefinitionRepository();
    const bingoGameRepository = new MockBingoGameRepository();

    const state = createState(boardDefinitionRepository, bingoGameRepository);

    expect(state.hasPlayableBoard()).toBe(false);
    expect(state.projects()).toEqual([]);
    expect(state.done()).toEqual([]);
  });

  it('laedt Fortschritt bei passender Board-Signatur', () => {
    const boardDefinitionRepository = new MockBoardDefinitionRepository();
    const bingoGameRepository = new MockBingoGameRepository();
    const projects = createProjects(4);
    boardDefinitionRepository.loadedDefinition = { projects };
    bingoGameRepository.loadedProgress = {
      boardSignature: createBoardSignature(projects),
      done: [true, false, true, false],
    };

    const state = createState(boardDefinitionRepository, bingoGameRepository);

    expect(state.hasPlayableBoard()).toBe(true);
    expect(state.done()).toEqual([true, false, true, false]);
  });

  it('setzt Fortschritt zurueck bei geaenderter Definition', () => {
    const boardDefinitionRepository = new MockBoardDefinitionRepository();
    const bingoGameRepository = new MockBingoGameRepository();
    boardDefinitionRepository.loadedDefinition = { projects: createProjects(4) };
    bingoGameRepository.loadedProgress = {
      boardSignature: 'old-signature',
      done: [true, true, true, true],
    };

    const state = createState(boardDefinitionRepository, bingoGameRepository);

    expect(state.done()).toEqual([false, false, false, false]);
    expect(bingoGameRepository.lastSavedProgress?.done).toEqual([false, false, false, false]);
  });

  it('toggle persistiert den aktualisierten Fortschritt', () => {
    const boardDefinitionRepository = new MockBoardDefinitionRepository();
    const bingoGameRepository = new MockBingoGameRepository();
    boardDefinitionRepository.loadedDefinition = { projects: createProjects(4) };

    const state = createState(boardDefinitionRepository, bingoGameRepository);
    state.toggle(1);

    expect(state.done()).toEqual([false, true, false, false]);
    expect(bingoGameRepository.lastSavedProgress?.done).toEqual([false, true, false, false]);
  });
});
