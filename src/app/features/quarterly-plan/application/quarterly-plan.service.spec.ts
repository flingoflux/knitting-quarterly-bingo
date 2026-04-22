import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { QuarterlyPlanService } from './quarterly-plan.service';
import { PersistedQuarterlyPlan } from '../infrastructure/local-storage-quarterly-plan.repository';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../domain/quarterly-plan.repository';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';

class MockQuarterlyPlanRepository {
  loadedPlan: PersistedQuarterlyPlan | null = null;
  lastSavedPlan: PersistedQuarterlyPlan | null = null;

  load(_quarterId: string): Result<PersistedQuarterlyPlan, string> {
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

  save(_quarterId: string, definition: PersistedQuarterlyPlan): void {
    this.lastSavedPlan = {
      quarterId: definition.quarterId,
      challenges: [...definition.challenges],
    };
    this.loadedPlan = this.lastSavedPlan;
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, index) => ({
    name: `Challenge ${index}`,
  }));
}

function createService(repository: MockQuarterlyPlanRepository): QuarterlyPlanService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: repository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: repository },
    ],
  });
  return runInInjectionContext(injector, () => new QuarterlyPlanService());
}

describe('QuarterlyPlanService', () => {
  it('initialisiert Defaults wenn kein persistiertes Board vorhanden ist', () => {
    const repository = new MockQuarterlyPlanRepository();

    const service = createService(repository);

    expect(service.challenges()).toEqual(DEFAULT_CHALLENGES);
    expect(repository.lastSavedPlan?.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('laedt persistierte Definition beim Start', () => {
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };

    const service = createService(repository);

    expect(service.challenges()).toHaveLength(4);
    expect(service.challenges()[0].name).toBe('Challenge 0');
  });

  it('tauscht Challenges und persistiert das Ergebnis', () => {
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const service = createService(repository);

    service.swapChallenges(0, 3);

    expect(service.challenges()[0].name).toBe('Challenge 3');
    expect(service.challenges()[3].name).toBe('Challenge 0');
    expect(repository.lastSavedPlan?.challenges[0].name).toBe('Challenge 3');
  });

  it('aktualisiert eine einzelne Challenge', () => {
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const service = createService(repository);

    service.updateChallenge(1, { name: 'Updated' });

    expect(service.challenges()[1].name).toBe('Updated');
  });

  it('setzt das Board auf Defaults zurueck', () => {
    const repository = new MockQuarterlyPlanRepository();
    repository.loadedPlan = { quarterId: '2026-Q2', challenges: createChallenges(4) };
    const service = createService(repository);

    service.resetPlan();

    expect(service.challenges()).toEqual(DEFAULT_CHALLENGES);
  });
});
