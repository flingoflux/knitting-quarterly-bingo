import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { PersistedQuarterlyPlan } from '../../quarterly-plan/infrastructure/local-storage-quarterly-plan.repository';
import { PlayBingoUseCase } from './play-bingo.use-case';
import { BingoGameProgress, ChallengeProgress, createPlanSignature } from '../domain/bingo-game';
import { QuarterId } from '../../../core/domain';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { LOAD_BINGO_PROGRESS_OUT_PORT } from './ports/out/load-bingo-progress.out-port';
import { PERSIST_BINGO_PROGRESS_OUT_PORT } from './ports/out/persist-bingo-progress.out-port';

const TEST_BOARD_ID = 'test-board-id';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedQuarterlyPlan | null = null;

  load(_quarterId: QuarterId): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }

  findById(_id: string): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }
}

class MockBingoGameRepository {
  loadedProgress: BingoGameProgress | null = null;
  lastSavedProgress: BingoGameProgress | null = null;

  load(_quarterId: QuarterId): BingoGameProgress | null {
    return this.loadedProgress;
  }

  save(_quarterId: QuarterId, progress: BingoGameProgress): void {
    this.lastSavedProgress = {
      quarterId: progress.quarterId,
      planSignature: progress.planSignature,
      challenges: [...progress.challenges],
      startedAt: progress.startedAt,
    };
    this.loadedProgress = this.lastSavedProgress;
  }

  persist(quarterId: QuarterId, progress: BingoGameProgress): void {
    this.save(quarterId, progress);
  }

  clear(_quarterId: QuarterId): void {
    this.loadedProgress = null;
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, index) => ({
    name: `C${index}`,
  }));
}

function createProgressChallenges(challenges: Challenge[], overrides: Partial<ChallengeProgress>[] = []): ChallengeProgress[] {
  return challenges.map((c, i) => ({
    name: c.name,
    planningImageId: undefined,
    progressImageId: undefined,
    completed: false,
    ...overrides[i],
  }));
}

function createService(
  boardDefinitionRepository: MockBoardDefinitionRepository,
  bingoGameRepository: MockBingoGameRepository,
): PlayBingoUseCase {
  const injector = Injector.create({
    providers: [
      { provide: LOAD_QUARTERLY_PLAN_OUT_PORT, useValue: boardDefinitionRepository },
      { provide: LOAD_BINGO_PROGRESS_OUT_PORT, useValue: bingoGameRepository },
      { provide: PERSIST_BINGO_PROGRESS_OUT_PORT, useValue: bingoGameRepository },
    ],
  });
  return runInInjectionContext(injector, () => new PlayBingoUseCase());
}

describe('PlayBingoUseCase', () => {
  it('hat kein spielbares Board ohne Definition', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.isQuarterPlayable('2026-Q2', false)).toBe(false);
    expect(service.challenges()).toHaveLength(0);
  });

  it('laedt Board-Definition beim Start', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges: createChallenges(16) };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    expect(service.challenges()).toHaveLength(16);
    expect(service.completed()).toHaveLength(16);
    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('laedt persistierten Spielfortschritt bei passender Signatur', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges };
    const bingoRepo = new MockBingoGameRepository();
    const overrides: Partial<ChallengeProgress>[] = [{ completed: true }];
    bingoRepo.loadedProgress = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(challenges),
      challenges: createProgressChallenges(challenges, overrides),
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.completed()[0]).toBe(true);
    expect(service.completed()[1]).toBe(false);
  });

  it('setzt Fortschritt zurück bei geänderter Board-Signatur', () => {
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges: createChallenges(16) };
    const bingoRepo = new MockBingoGameRepository();
    bingoRepo.loadedProgress = {
      quarterId: '2026-Q2',
      planSignature: 'old-signature',
      challenges: [],
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('toggled ein Feld und persistiert', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    service.persistToggledChallenge(0);

    expect(service.completed()[0]).toBe(true);
    expect(bingoRepo.lastSavedProgress?.challenges[0].completed).toBe(true);
  });

  it('erkennt Bingo in der ersten Zeile', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges };
    const bingoRepo = new MockBingoGameRepository();
    const overrides: Partial<ChallengeProgress>[] = [
      { completed: true },
      { completed: true },
      { completed: true },
      { completed: true },
    ];
    bingoRepo.loadedProgress = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(challenges),
      challenges: createProgressChallenges(challenges, overrides),
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);

    expect(service.bingoCells().has(0)).toBe(true);
    expect(service.bingoCells().has(3)).toBe(true);
    expect(service.bingoCells().has(4)).toBe(false);
  });

  it('speichert progressImageId und behält planningImageId', () => {
    const challenges = createChallenges(16);
    const challengesWithImage = challenges.map((c, i) => ({ ...c, imageId: i === 0 ? 'plan-img' : undefined }));
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges: challengesWithImage };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    service.persistProgressImage(0, 'progress-photo');

    expect(service.challenges()[0].progressImageId).toBe('progress-photo');
    expect(service.challenges()[0].planningImageId).toBe('plan-img');
    expect(bingoRepo.lastSavedProgress?.challenges[0].progressImageId).toBe('progress-photo');
  });

  it('setzt alle Challenges bei resetProgress zurück', () => {
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges };
    const bingoRepo = new MockBingoGameRepository();
    const overrides: Partial<ChallengeProgress>[] = Array.from({ length: 16 }, () => ({ completed: true }));
    bingoRepo.loadedProgress = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(challenges),
      challenges: createProgressChallenges(challenges, overrides),
      startedAt: new Date().toISOString(),
    };

    const service = createService(boardRepo, bingoRepo);
    service.persistResetProgress();

    expect(service.completed().every(c => !c)).toBe(true);
    expect(bingoRepo.lastSavedProgress?.challenges.every(c => !c.completed)).toBe(true);
  });
});
