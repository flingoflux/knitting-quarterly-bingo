import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { LocalStorageBoardRepository, PersistedBoardDefinition } from '../../board-configuration/infrastructure/local-storage-board.repository';
import { BOARD_DEFINITION_READER } from '../../board-configuration/domain/board-definition.repository';
import { BingoGameService } from './bingo-game.service';
import { LocalStorageBingoGameRepository } from '../infrastructure/local-storage-bingo-game.repository';
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

class MockBoardDefinitionWriter {
  save(_definition: PersistedBoardDefinition): void {}
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
      { provide: LocalStorageBingoGameRepository, useValue: bingoGameRepository },
      { provide: LocalStorageBoardRepository, useValue: new MockBoardDefinitionWriter() },
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
    boardRepo.loadedDefinition = { projects: createProjects(16) };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.projects()).toHaveLength(16);
    expect(service.done()).toHaveLength(16);
    expect(service.done().every(d => !d)).toBe(true);
  });

  it('laedt persistierten Spielfortschritt bei passender Signatur', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { projects };
    const bingoRepo = new MockBingoGameRepository();
    const done = new Array(16).fill(false);
    done[0] = true;
    bingoRepo.loadedProgress = { boardSignature: createBoardSignature(projects), done };

    const service = createService(boardRepo, bingoRepo);

    expect(service.done()[0]).toBe(true);
    expect(service.done()[1]).toBe(false);
  });

  it('setzt Fortschritt zurück bei geänderter Board-Signatur', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { projects: createProjects(16) };
    const bingoRepo = new MockBingoGameRepository();
    bingoRepo.loadedProgress = {
      boardSignature: 'old-signature',
      done: new Array(16).fill(true),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.done().every(d => !d)).toBe(true);
  });

  it('toggled ein Feld und persistiert', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { projects };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    service.toggle(0);

    expect(service.done()[0]).toBe(true);
    expect(bingoRepo.lastSavedProgress?.done[0]).toBe(true);
  });

  it('erkennt Bingo in der ersten Zeile', () => {
    const projects = createProjects(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { projects };
    const bingoRepo = new MockBingoGameRepository();
    const done = new Array(16).fill(false);
    done[0] = done[1] = done[2] = done[3] = true;
    bingoRepo.loadedProgress = { boardSignature: createBoardSignature(projects), done };

    const service = createService(boardRepo, bingoRepo);

    expect(service.bingoCells().has(0)).toBe(true);
    expect(service.bingoCells().has(3)).toBe(true);
    expect(service.bingoCells().has(4)).toBe(false);
  });
});
