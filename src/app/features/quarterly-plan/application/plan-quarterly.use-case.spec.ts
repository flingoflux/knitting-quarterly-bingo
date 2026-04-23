import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { PlanQuarterlyUseCase } from './plan-quarterly.use-case';
import { PersistedQuarterlyPlan } from '../infrastructure/local-storage-quarterly-plan.repository';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from './ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from './ports/out/persist-quarterly-plan.out-port';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { QuarterId } from '../../../core/domain';

class MockQuarterlyPlanRepository {
  loadedPlan: PersistedQuarterlyPlan | null = null;
  lastSavedPlan: PersistedQuarterlyPlan | null = null;

  load(_quarterId: QuarterId): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedPlan === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedPlan);
  }

  findById(_id: string): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedPlan === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedPlan);
  }

  save(_quarterId: QuarterId, definition: PersistedQuarterlyPlan): void {
    this.lastSavedPlan = {
      quarterId: definition.quarterId,
      challenges: [...definition.challenges],
    };
    this.loadedPlan = this.lastSavedPlan;
  }

  persist(quarterId: QuarterId, definition: PersistedQuarterlyPlan): void {
    this.save(quarterId, definition);
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, index) => ({
    name: `Challenge ${index}`,
  }));
}

function createUseCase(repository: MockQuarterlyPlanRepository): PlanQuarterlyUseCase {
  const injector = Injector.create({
    providers: [
      { provide: LOAD_QUARTERLY_PLAN_OUT_PORT, useValue: repository },
      { provide: PERSIST_QUARTERLY_PLAN_OUT_PORT, useValue: repository },
    ],
  });
  return runInInjectionContext(injector, () => new PlanQuarterlyUseCase());
}

describe('PlanQuarterlyUseCase', () => {
  it('should initialize default challenges when persisted board is missing', () => {
    // given
    const repository = new MockQuarterlyPlanRepository();

    const useCase = createUseCase(repository);

    // when + then
    expect(useCase.challenges()).toEqual(DEFAULT_CHALLENGES);
    expect(repository.lastSavedPlan?.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('should load persisted plan when one exists on startup', () => {
    // given
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };

    const useCase = createUseCase(repository);

    // when + then
    expect(useCase.challenges()).toHaveLength(4);
    expect(useCase.challenges()[0].name).toBe('Challenge 0');
  });

  it('should swap challenges and persist result when reorder is requested', () => {
    // given
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const useCase = createUseCase(repository);

    // when
    useCase.persistSwappedChallenges(0, 3);

    // then
    expect(useCase.challenges()[0].name).toBe('Challenge 3');
    expect(useCase.challenges()[3].name).toBe('Challenge 0');
    expect(repository.lastSavedPlan?.challenges[0].name).toBe('Challenge 3');
  });

  it('should update a single challenge and persist changes when editing', () => {
    // given
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const useCase = createUseCase(repository);

    // when
    useCase.persistUpdatedChallenge(1, { name: 'Updated' });

    // then
    expect(useCase.challenges()[1].name).toBe('Updated');
  });

  it('should reset board to default challenges when reset is requested', () => {
    // given
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const useCase = createUseCase(repository);

    // when
    useCase.persistDefaultQuarterlyPlan();

    // then
    expect(useCase.challenges()).toEqual(DEFAULT_CHALLENGES);
  });
});
