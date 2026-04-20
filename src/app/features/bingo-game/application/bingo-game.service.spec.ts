import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { Result } from '../../../shared/domain/result';
import { PersistedBoardDefinition } from '../../board-configuration/infrastructure/local-storage-board.repository';
import { BOARD_DEFINITION_READER } from '../../board-configuration/domain/board-definition.repository';
import { BingoGameService } from './bingo-game.service';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGameProgress, createBoardSignature } from '../domain/bingo-game';

const TEST_BOARD_ID = 'test-board-id';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedBoardDefinition | null = null;

  load(): Result<PersistedBoardDefinition, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }

  findById(_id: string): Result<PersistedBoardDefinition, string> {
    return this.load();
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
      boardDefinitionId: progress.boardDefinitionId,
      boardSignature: progress.boardSignature,
      boardSnapshot: [...progress.boardSnapshot],
      cellImages: [...progress.cellImages],
      done: [...progress.done],
      startedAt: progress.startedAt,
    };
    this.loadedProgress = this.lastSavedProgress;
  }
}

function createProjects(length = 16): BoardCell[] {
  return Array.from({ length }, (_, index) => ({
    title: `P${index}`,
  }));
}

function createService(
  boardDefinitionRepository: MockBoardDefinitionRepository,
  bingoGameRepository: MockBingoGameRepository,
): BingoGameService {
  const injector = Injector.create({
    providers: [
      { provide: BOARD_DEFINITION_READER, useValue: boardDefinitionRepository },
      { provide: BINGO_GAME_REPOSITORY, useValue: bingoGameRepository },
    ],
  });
  return runInInjectionContext(injector, () => new BingoGameService());
}

describe('BingoGameService', () => {
  it('hat kein spielbares Board ohne Definition', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.hasPlayableBoard()).toBe(false);
    expect(service.projects()).toHaveLength(0);
  });

  it('laedt Board-Definition beim Start', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, projects: createProjects(16) };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.projects()).toHaveLength(16);
    expect(service.done()).toHaveLength(16);
    expect(service.done().every(d => !d)).toBe(true);
  });

  it('laedt persistierten Spielfortschritt bei passender Signatur', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, projects };
    const bingoRepo = new MockBingoGameRepository();
    const done = new Array(16).fill(false);
    done[0] = true;
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: createBoardSignature(projects),
      boardSnapshot: projects.map(p => ({ title: p.title })),
      cellImages: new Array(16).fill(undefined),
      done,
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.done()[0]).toBe(true);
    expect(service.done()[1]).toBe(false);
  });

  it('setzt Fortschritt zurück bei geänderter Board-Signatur', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, projects: createProjects(16) };
    const bingoRepo = new MockBingoGameRepository();
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: 'old-signature',
      boardSnapshot: [],
      cellImages: [],
      done: new Array(16).fill(true),
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.done().every(d => !d)).toBe(true);
  });

  it('toggled ein Feld und persistiert', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, projects };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    service.toggle(0);

    expect(service.done()[0]).toBe(true);
    expect(bingoRepo.lastSavedProgress?.done[0]).toBe(true);
  });

  it('erkennt Bingo in der ersten Zeile', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, projects };
    const bingoRepo = new MockBingoGameRepository();
    const done = new Array(16).fill(false);
    done[0] = done[1] = done[2] = done[3] = true;
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: createBoardSignature(projects),
      boardSnapshot: projects.map(p => ({ title: p.title })),
      cellImages: new Array(16).fill(undefined),
      done,
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.bingoCells().has(0)).toBe(true);
    expect(service.bingoCells().has(3)).toBe(true);
    expect(service.bingoCells().has(4)).toBe(false);
  });
});
