import { InjectionToken } from '@angular/core';
import { BoardViewMode } from './board-view-mode';

export interface UserSettingsRepository {
  loadBoardViewMode(): BoardViewMode;
  saveBoardViewMode(mode: BoardViewMode): void;
}

export const USER_SETTINGS_REPOSITORY = new InjectionToken<UserSettingsRepository>('UserSettingsRepository');
