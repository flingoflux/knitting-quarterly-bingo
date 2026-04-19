import { InjectionToken } from '@angular/core';
import { BoardCell } from '../domain/board-cell';

export interface BoardDefinitionReader {
  load(): { projects: BoardCell[] } | null;
}

export const BOARD_DEFINITION_READER = new InjectionToken<BoardDefinitionReader>('BoardDefinitionReader');
