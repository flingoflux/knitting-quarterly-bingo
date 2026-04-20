import { InjectionToken } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { Result } from '../../../shared/domain/result';

export interface BoardDefinitionReader {
  load(): Result<{ projects: BoardCell[] }, string>;
}

export const BOARD_DEFINITION_READER = new InjectionToken<BoardDefinitionReader>('BoardDefinitionReader');

export interface BoardDefinitionWriter {
  save(definition: { projects: BoardCell[] }): void;
}

export const BOARD_DEFINITION_WRITER = new InjectionToken<BoardDefinitionWriter>('BoardDefinitionWriter');
