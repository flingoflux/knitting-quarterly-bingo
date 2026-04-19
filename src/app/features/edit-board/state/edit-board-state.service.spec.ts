import { describe, expect, it } from 'vitest';
import { BoardCell } from '../../../shared/domain/board-cell';
import { EditBoardStateService } from './edit-board-state.service';
import { BoardDefinitionRepositoryService, PersistedBoardDefinition } from './board-definition-repository.service';
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
    cat: 'Cat',
    catKey: 'cat',
  }));
}

function createState(repository: MockBoardDefinitionRepository): EditBoardStateService {
  return new EditBoardStateService(repository as unknown as BoardDefinitionRepositoryService);
}

describe('EditBoardStateService', () => {
  it('initialisiert Defaults wenn kein persistiertes Board vorhanden ist', () => {
    const repository = new MockBoardDefinitionRepository();

    const state = createState(repository);

    expect(state.projects()).toEqual(DEFAULT_BOARD_PROJECTS);
    expect(repository.lastSavedDefinition?.projects).toEqual(DEFAULT_BOARD_PROJECTS);
  });

  it('laedt persistierte Definition beim Start', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };

    const state = createState(repository);

    expect(state.projects()).toHaveLength(4);
    expect(state.projects()[0].title).toBe('Project 0');
  });

  it('tauscht Projekte und persistiert das Ergebnis', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };
    const state = createState(repository);

    state.swapProjects(0, 3);

    expect(state.projects()[0].title).toBe('Project 3');
    expect(state.projects()[3].title).toBe('Project 0');
    expect(repository.lastSavedDefinition?.projects[0].title).toBe('Project 3');
  });

  it('aktualisiert ein Projekt und persistiert die Aenderung', () => {
    const repository = new MockBoardDefinitionRepository();
    repository.loadedDefinition = { projects: createProjects(4) };
    const state = createState(repository);

    state.updateProject(1, {
      title: 'Neues Projekt',
      cat: 'Technik',
      catKey: 'technik',
    });

    expect(state.projects()[1].title).toBe('Neues Projekt');
    expect(state.projects()[1].cat).toBe('Technik');
    expect(state.projects()[1].catKey).toBe('technik');
    expect(repository.lastSavedDefinition?.projects[1].title).toBe('Neues Projekt');
  });
});
