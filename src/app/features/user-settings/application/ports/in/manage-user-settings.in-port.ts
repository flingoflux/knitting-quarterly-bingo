import { InjectionToken } from '@angular/core';
import { BoardViewMode } from '../../../domain/board-view-mode';
import { LayoutMode } from '../../../domain/layout-mode';

export interface ManageUserSettingsInPort {
  loadBoardViewMode(): BoardViewMode;
  persistBoardViewMode(mode: BoardViewMode): void;
  loadLayoutMode(): LayoutMode;
  persistLayoutMode(mode: LayoutMode): void;
}

export const MANAGE_USER_SETTINGS_IN_PORT = new InjectionToken<ManageUserSettingsInPort>('ManageUserSettingsInPort');
