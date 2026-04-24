import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { LoadBoardViewModeOutPort } from '../application/ports/out/load-board-view-mode.out-port';
import { PersistBoardViewModeOutPort } from '../application/ports/out/persist-board-view-mode.out-port';
import { BoardViewMode, DEFAULT_BOARD_VIEW_MODE, isBoardViewMode } from '../domain/board-view-mode';
import { UserSettingsRepository } from '../domain/user-settings.repository';

@Injectable({ providedIn: 'root' })
export class LocalStorageUserSettingsRepository
  implements UserSettingsRepository, LoadBoardViewModeOutPort, PersistBoardViewModeOutPort {
  private readonly boardViewModeStorageKey = 'kq-bingo-user-setting-board-view-mode-v1';

  constructor(private readonly storage: StorageService) {}

  loadBoardViewMode(): BoardViewMode {
    const rawMode = this.storage.getItem<unknown>(this.boardViewModeStorageKey);
    if (isBoardViewMode(rawMode)) {
      return rawMode;
    }

    this.storage.setItem(this.boardViewModeStorageKey, DEFAULT_BOARD_VIEW_MODE);
    return DEFAULT_BOARD_VIEW_MODE;
  }

  saveBoardViewMode(mode: BoardViewMode): void {
    this.storage.setItem(this.boardViewModeStorageKey, mode);
  }

  persistBoardViewMode(mode: BoardViewMode): void {
    this.saveBoardViewMode(mode);
  }
}
