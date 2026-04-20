import { BoardCell } from '../../../shared/domain/board-cell';
import { DEFAULT_BOARD_PROJECTS } from '../../../shared/domain/default-board-projects';

export interface BoardDefinition {
  projects: BoardCell[];
}

export function createDefaultBoardDefinition(): BoardDefinition {
  return {
    projects: [...DEFAULT_BOARD_PROJECTS],
  };
}

export function reorderBoardProjects(projects: BoardCell[], startIndex: number, targetIndex: number): BoardCell[] {
  if (!isValidIndex(startIndex, projects.length) || !isValidIndex(targetIndex, projects.length)) {
    return [...projects];
  }

  const reordered = [...projects];
  [reordered[startIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[startIndex]];
  return reordered;
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
