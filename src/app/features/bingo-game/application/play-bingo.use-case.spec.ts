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
  it('should not expose playable board when definition is missing', () => {
    // given
    const boardRepo = new MockBoardDefinitionRepository();
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    // when + then
    expect(service.isQuarterPlayable('2026-Q2', false)).toBe(false);
    expect(service.challenges()).toHaveLength(0);
  });

  it('should load board definition on initialization', () => {
    // given
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges: createChallenges(16) };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);

    // when + then
    expect(service.challenges()).toHaveLength(16);
    expect(service.completed()).toHaveLength(16);
    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('should load persisted progress when plan signature matches', () => {
    // given
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

    // when + then
    expect(service.completed()[0]).toBe(true);
    expect(service.completed()[1]).toBe(false);
  });

  it('should reset progress when plan signature changed', () => {
    // given
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

    // when + then
    expect(service.completed().every(d => !d)).toBe(true);
  });

  it('should toggle a challenge and persist progress when field is clicked', () => {
    // given
    const challenges = createChallenges(16);
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    // when
    service.persistToggledChallenge(0);

    // then
    expect(service.completed()[0]).toBe(true);
    expect(bingoRepo.lastSavedProgress?.challenges[0].completed).toBe(true);
  });

  it('should detect bingo cells when first row is completed', () => {
    // given
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

    // when + then
    expect(service.bingoCells().has(0)).toBe(true);
    expect(service.bingoCells().has(3)).toBe(true);
    expect(service.bingoCells().has(4)).toBe(false);
  });

  it('should save progress image id when updating progress image', () => {
    // given
    const challenges = createChallenges(16);
    const challengesWithImage = challenges.map((c, i) => ({ ...c, imageId: i === 0 ? 'plan-img' : undefined }));
    const boardRepo = new MockBoardDefinitionRepository();
    boardRepo.loadedDefinition = { quarterId: '2026-Q2', challenges: challengesWithImage };
    const bingoRepo = new MockBingoGameRepository();

    const service = createService(boardRepo, bingoRepo);
    // when
    service.persistProgressImage(0, 'progress-photo');

    // then
    expect(service.challenges()[0].progressImageId).toBe('progress-photo');
    expect(service.challenges()[0].planningImageId).toBe('plan-img');
    expect(bingoRepo.lastSavedProgress?.challenges[0].progressImageId).toBe('progress-photo');
  });

  it('should reset all challenges when resetProgress is called', () => {
    // given
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
    // when
    service.persistResetProgress();

    // then
    expect(service.completed().every(c => !c)).toBe(true);
    expect(bingoRepo.lastSavedProgress?.challenges.every(c => !c.completed)).toBe(true);
  });
});
