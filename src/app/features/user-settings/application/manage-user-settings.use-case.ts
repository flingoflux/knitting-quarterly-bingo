import { Injectable, inject } from '@angular/core';
import { ManageUserSettingsInPort } from './ports/in/manage-user-settings.in-port';
import { BoardViewMode } from '../domain/board-view-mode';
import { LayoutMode } from '../domain/layout-mode';
import { LOAD_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/load-board-view-mode.out-port';
import { PERSIST_BOARD_VIEW_MODE_OUT_PORT } from './ports/out/persist-board-view-mode.out-port';
import { LOAD_LAYOUT_MODE_OUT_PORT } from './ports/out/load-layout-mode.out-port';
import { PERSIST_LAYOUT_MODE_OUT_PORT } from './ports/out/persist-layout-mode.out-port';

@Injectable({ providedIn: 'root' })
export class ManageUserSettingsUseCase implements ManageUserSettingsInPort {
  private readonly boardViewModeLoader = inject(LOAD_BOARD_VIEW_MODE_OUT_PORT);
  private readonly boardViewModePersister = inject(PERSIST_BOARD_VIEW_MODE_OUT_PORT);
  private readonly layoutModeLoader = inject(LOAD_LAYOUT_MODE_OUT_PORT);
  private readonly layoutModePersister = inject(PERSIST_LAYOUT_MODE_OUT_PORT);

  loadBoardViewMode(): BoardViewMode {
    return this.boardViewModeLoader.loadBoardViewMode();
  }

  persistBoardViewMode(mode: BoardViewMode): void {
    this.boardViewModePersister.persistBoardViewMode(mode);
  }

  loadLayoutMode(): LayoutMode {
    return this.layoutModeLoader.loadLayoutMode();
  }

  persistLayoutMode(mode: LayoutMode): void {
    this.layoutModePersister.persistLayoutMode(mode);
  }
}
