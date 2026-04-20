import { InjectionToken } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';

export interface BoardDefinitionReader {
  load(): { projects: BoardCell[] } | null;
}

export const BOARD_DEFINITION_READER = new InjectionToken<BoardDefinitionReader>('BoardDefinitionReader');
