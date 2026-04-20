import { describe, expect, it } from 'vitest';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardConfigurationService } from './board-configuration.service';
import { LocalStorageBoardRepository, PersistedBoardDefinition } from '../infrastructure/local-storage-board.repository';
import { DEFAULT_BOARD_PROJECTS } from '../../../shared/domain/default-board-projects';

class MockBoardDefinitionRepository {
  loadedDefinition: PersistedBoardDefinition | null = null;
  lastSavedDefinition: PersistedBoardDefinition | null = null;

  load(): PersistedBoardDefinition | null {
    return this.loadedDefinition;
  }

  save(definition: PersistedBoardDefinition): void {
    this.lastSavedDefinition = {
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
  return new BoardConfigurationService(repository as unknown as LocalStorageBoardRepository);
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
    repository.loadedDefinition = { projects: createProjects(4) };

    const service = createService(repository);

    expect(service.projects()).toHaveLength(4);
    expect(service.projects()[0].title).toBe('Project 0');
  });

  it('tauscht Projekte und persistiert das Ergebnis', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };
    const service = createService(repository);

    service.swapProjects(0, 3);

    expect(service.projects()[0].title).toBe('Project 3');
    expect(service.projects()[3].title).toBe('Project 0');
    expect(repository.lastSavedDefinition?.projects[0].title).toBe('Project 3');
  });

  it('aktualisiert ein einzelnes Projekt', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };
    const service = createService(repository);

    service.updateProject(1, { title: 'Updated' });

    expect(service.projects()[1].title).toBe('Updated');
  });

  it('setzt das Board auf Defaults zurueck', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };
    const service = createService(repository);

    service.resetBoard();

    expect(service.projects()).toEqual(DEFAULT_BOARD_PROJECTS);
  });
});
