import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { BoardViewMode } from '../domain/board-view-mode';
import { LOAD_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/load-board-view-mode.out-port';
import { PERSIST_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/persist-board-view-mode.out-port';
import { ManageUserSettingsUseCase } from './manage-user-settings.use-case';

class MockBoardViewModeLoader {
  mode: BoardViewMode = 'polaroid';
  loadBoardViewMode(): BoardViewMode { return this.mode; }
}

class MockBoardViewModePersister {
  persistedMode: BoardViewMode | null = null;
  persistBoardViewMode(mode: BoardViewMode): void { this.persistedMode = mode; }
}

function createUseCase(
  boardLoader: MockBoardViewModeLoader,
  boardPersister: MockBoardViewModePersister,
): ManageUserSettingsUseCase {
  const injector = Injector.create({
    providers: [
      { provide: LOAD_BOARD_VIEW_MODE_OUT_PORT, useValue: boardLoader },
      { provide: PERSIST_BOARD_VIEW_MODE_OUT_PORT, useValue: boardPersister },
    ],
  });
  return runInInjectionContext(injector, () => new ManageUserSettingsUseCase());
}

describe('ManageUserSettingsUseCase', () => {
  it('should load board view mode from out port', () => {
    const loader = new MockBoardViewModeLoader();
    loader.mode = 'kompakt';
    const persister = new MockBoardViewModePersister();

    const useCase = createUseCase(loader, persister);

    expect(useCase.loadBoardViewMode()).toBe('kompakt');
  });

  it('should persist board view mode through out port', () => {
    const loader = new MockBoardViewModeLoader();
    const persister = new MockBoardViewModePersister();

    const useCase = createUseCase(loader, persister);
    useCase.persistBoardViewMode('polaroid');

    expect(persister.persistedMode).toBe('polaroid');
  });
});
