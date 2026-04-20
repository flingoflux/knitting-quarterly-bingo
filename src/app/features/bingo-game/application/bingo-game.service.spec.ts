import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { PersistedQuarterlyPlan } from '../../board-configuration/infrastructure/local-storage-board.repository';
import { QUARTERLY_PLAN_READER } from '../../board-configuration/domain/quarterly-plan.repository';
import { BingoGameService } from './bingo-game.service';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGameProgress, createBoardSignature } from '../domain/bingo-game';

const TEST_BOARD_ID = 'test-board-id';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedQuarterlyPlan | null = null;

  load(): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }

  findById(_id: string): Result<PersistedQuarterlyPlan, string> {
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
      challenges: [...progress.challenges],
      cellImages: [...progress.cellImages],
      completed: [...progress.completed],
      startedAt: progress.startedAt,
    };
    this.loadedProgress = this.lastSavedProgress;
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, index) => ({
    name: `C${index}`,
  }));
}

function createService(
  boardDefinitionRepository: MockBoardDefinitionRepository,
  bingoGameRepository: MockBingoGameRepository,
): BingoGameService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: boardDefinitionRepository },
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
    expect(service.challenges()).toHaveLength(0);
  });

  it('laedt Board-Definition beim Start', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, challenges: createChallenges(16) };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.challenges()).toHaveLength(16);
    expect(service.completed()).toHaveLength(16);
    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('laedt persistierten Spielfortschritt bei passender Signatur', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, challenges };
    const bingoRepo = new MockBingoGameRepository();
    const completed = new Array(16).fill(false);
    completed[0] = true;
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: createBoardSignature(challenges),
      challenges: challenges.map(c => ({ name: c.name })),
      cellImages: new Array(16).fill(undefined),
      completed,
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.completed()[0]).toBe(true);
    expect(service.completed()[1]).toBe(false);
  });

  it('setzt Fortschritt zurück bei geänderter Board-Signatur', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, challenges: createChallenges(16) };
    const bingoRepo = new MockBingoGameRepository();
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: 'old-signature',
      challenges: [],
      cellImages: [],
      completed: new Array(16).fill(true),
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('toggled ein Feld und persistiert', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, challenges };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    service.toggle(0);

    expect(service.completed()[0]).toBe(true);
    expect(bingoRepo.lastSavedProgress?.completed[0]).toBe(true);
  });

  it('erkennt Bingo in der ersten Zeile', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { id: TEST_BOARD_ID, challenges };
    const bingoRepo = new MockBingoGameRepository();
    const completed = new Array(16).fill(false);
    completed[0] = completed[1] = completed[2] = completed[3] = true;
    bingoRepo.loadedProgress = {
      boardDefinitionId: TEST_BOARD_ID,
      boardSignature: createBoardSignature(challenges),
      challenges: challenges.map(c => ({ name: c.name })),
      cellImages: new Array(16).fill(undefined),
      completed,
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.bingoCells().has(0)).toBe(true);
    expect(service.bingoCells().has(3)).toBe(true);
    expect(service.bingoCells().has(4)).toBe(false);
  });
});
