import { BoardCell } from '../../../shared/domain/board-cell';
import { DEFAULT_BOARD_PROJECTS } from '../../../shared/domain/default-board-projects';

export class BoardDefinition {
  private constructor(private readonly _projects: readonly BoardCell[]) {}

  static createDefault(): BoardDefinition {
    return new BoardDefinition([...DEFAULT_BOARD_PROJECTS]);
  }

  static fromProjects(projects: readonly BoardCell[]): BoardDefinition {
    return new BoardDefinition([...projects]);
  }

  get projects(): readonly BoardCell[] {
    return this._projects;
  }

  reorder(startIndex: number, targetIndex: number): BoardDefinition {
    const { length } = this._projects;
    if (!isValidIndex(startIndex, length) || !isValidIndex(targetIndex, length)) {
      return new BoardDefinition([...this._projects]);
    }
    const reordered = [...this._projects];
    [reordered[startIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[startIndex]];
    return new BoardDefinition(reordered);
  }

  update(index: number, cell: BoardCell): BoardDefinition {
    if (!isValidIndex(index, this._projects.length)) {
      return new BoardDefinition([...this._projects]);
    }
    const updated = [...this._projects];
    updated[index] = { ...cell };
    return new BoardDefinition(updated);
  }

  toPlain(): { projects: BoardCell[] } {
    return { projects: [...this._projects] as BoardCell[] };
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
