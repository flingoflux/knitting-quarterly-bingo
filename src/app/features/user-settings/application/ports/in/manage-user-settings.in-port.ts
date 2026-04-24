import { InjectionToken } from '@angular/core';
import { BoardViewMode } from '../../../domain/board-view-mode';

export interface ManageUserSettingsInPort {
  loadBoardViewMode(): BoardViewMode;
  persistBoardViewMode(mode: BoardViewMode): void;
}

export const MANAGE_USER_SETTINGS_IN_PORT = new InjectionToken<ManageUserSettingsInPort>('ManageUserSettingsInPort');
