import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { Result } from '../../../shared/domain/result';
import { BoardConfigurationService } from './board-configuration.service';
import { PersistedQuarterlyPlan } from '../infrastructure/local-storage-board.repository';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../domain/quarterly-plan.repository';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedQuarterlyPlan | null = null;
  lastSavedDefinition: PersistedQuarterlyPlan | null = null;

  load(): Result<PersistedQuarterlyPlan, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }

  findById(_id: string): Result<PersistedQuarterlyPlan, string> {
    return this.load();
  }

  save(definition: PersistedQuarterlyPlan): void {
    this.lastSavedDefinition = {
      id: definition.id,
      challenges: [...definition.challenges],
    };
    this.loadedDefinition = this.lastSavedDefinition;
  }
}

function createChallenges(length = 16): Challenge[] {
  return Array.from({ length }, (_, index) => ({
    name: `Challenge ${index}`,
  }));
}

function createService(repository: MockBoardDefinitionRepository): BoardConfigurationService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: repository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: repository },
    ],
  });
  return runInInjectionContext(injector, () => new BoardConfigurationService());
}

describe('BoardConfigurationService', () => {
  it('initialisiert Defaults wenn kein persistiertes Board vorhanden ist', () => {
    const repository = new MockBoardDefinitionRepository();

    const service = createService(repository);

    expect(service.challenges()).toEqual(DEFAULT_CHALLENGES);
    expect(repository.lastSavedDefinition?.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('laedt persistierte Definition beim Start', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', challenges: createChallenges(4) };

    const service = createService(repository);

    expect(service.challenges()).toHaveLength(4);
    expect(service.challenges()[0].name).toBe('Challenge 0');
  });

  it('tauscht Challenges und persistiert das Ergebnis', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', challenges: createChallenges(4) };
    const service = createService(repository);

    service.swapChallenges(0, 3);

    expect(service.challenges()[0].name).toBe('Challenge 3');
    expect(service.challenges()[3].name).toBe('Challenge 0');
    expect(repository.lastSavedDefinition?.challenges[0].name).toBe('Challenge 3');
  });

  it('aktualisiert eine einzelne Challenge', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', challenges: createChallenges(4) };
    const service = createService(repository);

    service.updateChallenge(1, { name: 'Updated' });

    expect(service.challenges()[1].name).toBe('Updated');
  });

  it('setzt das Board auf Defaults zurueck', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', challenges: createChallenges(4) };
    const service = createService(repository);

    service.resetBoard();

    expect(service.challenges()).toEqual(DEFAULT_CHALLENGES);
  });
});
