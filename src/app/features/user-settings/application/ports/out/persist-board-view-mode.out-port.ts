import { InjectionToken } from '@angular/core';
import { BoardViewMode } from '../../../domain/board-view-mode';

export interface PersistBoardViewModeOutPort {
  persistBoardViewMode(mode: BoardViewMode): void;
}

export const PERSIST_BOARD_VIEW_MODE_OUT_PORT = new InjectionToken<PersistBoardViewModeOutPort>('PersistBoardViewModeOutPort');
