import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { QuarterId } from '../../../core/domain';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/persist-quarterly-plan.out-port';
import { PERSIST_BINGO_PROGRESS_OUT_PORT } from './ports/out/persist-bingo-progress.out-port';
import { StartBingoFromPlanUseCase } from './start-bingo-from-plan.use-case';
import { QuarterlyPlanData } from '../../quarterly-plan/domain/quarterly-plan.repository';
import { BingoGameProgress } from '../domain/bingo-game';

class MockPlanLoader {
  planToReturn: QuarterlyPlanData | null = null;

  load(_quarterId: QuarterId): Result<QuarterlyPlanData, string> {
    if (this.planToReturn === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.planToReturn);
  }

  findById(_id: QuarterId): Result<QuarterlyPlanData, string> {
    return this.load(_id);
  }
}

class MockPlanPersister {
  lastPersistedQuarterId: QuarterId | null = null;
  lastPersistedPlan: QuarterlyPlanData | null = null;

  persist(quarterId: QuarterId, plan: QuarterlyPlanData): void {
    this.lastPersistedQuarterId = quarterId;
    this.lastPersistedPlan = plan;
  }
}

class MockBingoProgressPersister {
  clearedQuarterId: QuarterId | null = null;

  persist(_quarterId: QuarterId, _progress: BingoGameProgress): void {}

  clear(quarterId: QuarterId): void {
    this.clearedQuarterId = quarterId;
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, i) => ({ name: `Challenge ${i}` }));
}

function createUseCase(
  planLoader: MockPlanLoader,
  planPersister: MockPlanPersister,
  bingoProgressPersister: MockBingoProgressPersister,
): StartBingoFromPlanUseCase {
  const injector = Injector.create({
    providers: [
      { provide: LOAD_QUARTERLY_PLAN_OUT_PORT, useValue: planLoader },
      { provide: PERSIST_QUARTERLY_PLAN_OUT_PORT, useValue: planPersister },
      { provide: PERSIST_BINGO_PROGRESS_OUT_PORT, useValue: bingoProgressPersister },
    ],
  });
  return runInInjectionContext(injector, () => new StartBingoFromPlanUseCase());
}

describe('StartBingoFromPlanUseCase', () => {
  it('should return false when no plan exists for source quarter', () => {
    // given
    const planLoader = new MockPlanLoader();
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    const result = useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(result).toBe(false);
  });

  it('should not persist plan when source plan is missing', () => {
    // given
    const planLoader = new MockPlanLoader();
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(planPersister.lastPersistedPlan).toBeNull();
  });

  it('should not clear bingo progress when source plan is missing', () => {
    // given
    const planLoader = new MockPlanLoader();
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(bingoProgressPersister.clearedQuarterId).toBeNull();
  });

  it('should return false when source plan has no challenges', () => {
    // given
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges: [] };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    const result = useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(result).toBe(false);
    expect(planPersister.lastPersistedPlan).toBeNull();
    expect(bingoProgressPersister.clearedQuarterId).toBeNull();
  });

  it('should return true when source plan has challenges', () => {
    // given
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges: createChallenges(16) };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    const result = useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(result).toBe(true);
  });

  it('should persist source challenges under current quarter id', () => {
    // given
    const challenges = createChallenges(16);
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(planPersister.lastPersistedPlan).not.toBeNull();
    expect(planPersister.lastPersistedPlan!.challenges).toEqual(challenges);
  });

  it('should persist plan under current quarter id, not source quarter id', () => {
    // given
    const challenges = createChallenges(16);
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then: plan stored under current quarter, not source quarter
    expect(planPersister.lastPersistedQuarterId!.toString()).not.toBe('2026-Q3');
    expect(planPersister.lastPersistedPlan!.quarterId).not.toBe('2026-Q3');
  });

  it('should set plan quarterId consistently with the persisted quarter key', () => {
    // given
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges: createChallenges(16) };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then: quarterId in the plan data matches the storage key
    expect(planPersister.lastPersistedPlan!.quarterId).toBe(
      planPersister.lastPersistedQuarterId!.toString(),
    );
  });

  it('should clear bingo progress for current quarter on successful start', () => {
    // given
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges: createChallenges(16) };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then
    expect(bingoProgressPersister.clearedQuarterId).not.toBeNull();
  });

  it('should clear bingo progress for the same quarter the plan is persisted to', () => {
    // given
    const planLoader = new MockPlanLoader();
    planLoader.planToReturn = { quarterId: '2026-Q3', challenges: createChallenges(16) };
    const planPersister = new MockPlanPersister();
    const bingoProgressPersister = new MockBingoProgressPersister();
    const useCase = createUseCase(planLoader, planPersister, bingoProgressPersister);

    // when
    useCase.startBingoFromPlan('2026-Q3');

    // then: plan and bingo progress are aligned on the same target quarter
    expect(bingoProgressPersister.clearedQuarterId!.toString()).toBe(
      planPersister.lastPersistedQuarterId!.toString(),
    );
  });
});
