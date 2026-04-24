import { InjectionToken } from '@angular/core';
import { BoardViewMode } from '../../../domain/board-view-mode';

export interface LoadBoardViewModeOutPort {
  loadBoardViewMode(): BoardViewMode;
}

export const LOAD_BOARD_VIEW_MODE_OUT_PORT = new InjectionToken<LoadBoardViewModeOutPort>('LoadBoardViewModeOutPort');
