import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { BoardViewMode } from '../domain/board-view-mode';
import { LayoutMode } from '../domain/layout-mode';
import { LOAD_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/load-board-view-mode.out-port';
import { PERSIST_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/persist-board-view-mode.out-port';
import { LOAD_LAYOUT_MODE_OUT_PORT } from './ports/out/load-layout-mode.out-port';
import { PERSIST_LAYOUT_MODE_OUT_PORT } from './ports/out/persist-layout-mode.out-port';
import { ManageUserSettingsUseCase } from './manage-user-settings.use-case';

class MockBoardViewModeLoader {
  mode: BoardViewMode = 'polaroid';
  loadBoardViewMode(): BoardViewMode { return this.mode; }
}

class MockBoardViewModePersister {
  persistedMode: BoardViewMode | null = null;
  persistBoardViewMode(mode: BoardViewMode): void { this.persistedMode = mode; }
}

class MockLayoutModeLoader {
  mode: LayoutMode = 'auto';
  loadLayoutMode(): LayoutMode { return this.mode; }
}

class MockLayoutModePersister {
  persistedMode: LayoutMode | null = null;
  persistLayoutMode(mode: LayoutMode): void { this.persistedMode = mode; }
}

function createUseCase(
  boardLoader: MockBoardViewModeLoader,
  boardPersister: MockBoardViewModePersister,
  layoutLoader = new MockLayoutModeLoader(),
  layoutPersister = new MockLayoutModePersister(),
): ManageUserSettingsUseCase {
  const injector = Injector.create({
    providers: [
      { provide: LOAD_BOARD_VIEW_MODE_OUT_PORT, useValue: boardLoader },
      { provide: PERSIST_BOARD_VIEW_MODE_OUT_PORT, useValue: boardPersister },
      { provide: LOAD_LAYOUT_MODE_OUT_PORT, useValue: layoutLoader },
      { provide: PERSIST_LAYOUT_MODE_OUT_PORT, useValue: layoutPersister },
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
    useCase.persistBoardViewMode('kompakt');

    expect(persister.persistedMode).toBe('kompakt');
  });

  it('should load layout mode from out port', () => {
    const layoutLoader = new MockLayoutModeLoader();
    layoutLoader.mode = 'mobile';

    const useCase = createUseCase(new MockBoardViewModeLoader(), new MockBoardViewModePersister(), layoutLoader);

    expect(useCase.loadLayoutMode()).toBe('mobile');
  });

  it('should persist layout mode through out port', () => {
    const layoutPersister = new MockLayoutModePersister();

    const useCase = createUseCase(new MockBoardViewModeLoader(), new MockBoardViewModePersister(), new MockLayoutModeLoader(), layoutPersister);
    useCase.persistLayoutMode('desktop');

    expect(layoutPersister.persistedMode).toBe('desktop');
  });
});
