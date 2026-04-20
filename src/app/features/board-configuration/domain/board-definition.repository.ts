import { InjectionToken } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { Result } from '../../../shared/domain/result';

export interface BoardDefinitionData {
  id: string;
  projects: BoardCell[];
}

export interface BoardDefinitionReader {
  load(): Result<BoardDefinitionData, string>;
  findById(id: string): Result<BoardDefinitionData, string>;
}

export const BOARD_DEFINITION_READER = new InjectionToken<BoardDefinitionReader>('BoardDefinitionReader');

export interface BoardDefinitionWriter {
  save(definition: BoardDefinitionData): void;
}

export const BOARD_DEFINITION_WRITER = new InjectionToken<BoardDefinitionWriter>('BoardDefinitionWriter');
