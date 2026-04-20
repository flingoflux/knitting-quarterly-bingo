import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { Result } from '../../../shared/domain/result';
import { BoardConfigurationService } from './board-configuration.service';
import { PersistedBoardDefinition } from '../infrastructure/local-storage-board.repository';
import { BOARD_DEFINITION_READER, BOARD_DEFINITION_WRITER } from '../domain/board-definition.repository';
import { DEFAULT_BOARD_PROJECTS } from '../../../shared/domain/default-board-projects';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedBoardDefinition | null = null;
  lastSavedDefinition: PersistedBoardDefinition | null = null;

  load(): Result<PersistedBoardDefinition, string> {
    if (this.loadedDefinition === null) {
      return Result.err('not-found');
    }
    return Result.ok(this.loadedDefinition);
  }

  findById(_id: string): Result<PersistedBoardDefinition, string> {
    return this.load();
  }

  save(definition: PersistedBoardDefinition): void {
    this.lastSavedDefinition = {
      id: definition.id,
      projects: [...definition.projects],
    };
    this.loadedDefinition = this.lastSavedDefinition;
  }
}

function createProjects(length = 16): BoardCell[] {
  return Array.from({ length }, (_, index) => ({
    title: `Project ${index}`,
  }));
}

function createService(repository: MockBoardDefinitionRepository): BoardConfigurationService {
  const injector = Injector.create({
    providers: [
      { provide: BOARD_DEFINITION_READER, useValue: repository },
      { provide: BOARD_DEFINITION_WRITER, useValue: repository },
    ],
  });
  return runInInjectionContext(injector, () => new BoardConfigurationService());
}

describe('BoardConfigurationService', () => {
  it('initialisiert Defaults wenn kein persistiertes Board vorhanden ist', () => {
    const repository = new MockBoardDefinitionRepository();

    const service = createService(repository);

    expect(service.projects()).toEqual(DEFAULT_BOARD_PROJECTS);
    expect(repository.lastSavedDefinition?.projects).toEqual(DEFAULT_BOARD_PROJECTS);
  });

  it('laedt persistierte Definition beim Start', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', projects: createProjects(4) };

    const service = createService(repository);

    expect(service.projects()).toHaveLength(4);
    expect(service.projects()[0].title).toBe('Project 0');
  });

  it('tauscht Projekte und persistiert das Ergebnis', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', projects: createProjects(4) };
    const service = createService(repository);

    service.swapProjects(0, 3);

    expect(service.projects()[0].title).toBe('Project 3');
    expect(service.projects()[3].title).toBe('Project 0');
    expect(repository.lastSavedDefinition?.projects[0].title).toBe('Project 3');
  });

  it('aktualisiert ein einzelnes Projekt', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', projects: createProjects(4) };
    const service = createService(repository);

    service.updateProject(1, { title: 'Updated' });

    expect(service.projects()[1].title).toBe('Updated');
  });

  it('setzt das Board auf Defaults zurueck', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { id: 'test-id', projects: createProjects(4) };
    const service = createService(repository);

    service.resetBoard();

    expect(service.projects()).toEqual(DEFAULT_BOARD_PROJECTS);
  });
});
