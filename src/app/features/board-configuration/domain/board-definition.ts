import { BoardCell } from '../../../shared/domain/board-cell';
import { DEFAULT_BOARD_PROJECTS } from '../../../shared/domain/default-board-projects';

export class BoardDefinition {
  private constructor(
    readonly id: string,
    private readonly _projects: readonly BoardCell[],
  ) {}

  static createDefault(): BoardDefinition {
    return new BoardDefinition(crypto.randomUUID(), [...DEFAULT_BOARD_PROJECTS]);
  }

  static fromProjects(projects: readonly BoardCell[], id: string): BoardDefinition {
    return new BoardDefinition(id, [...projects]);
  }

  get projects(): readonly BoardCell[] {
    return this._projects;
  }

  reorder(startIndex: number, targetIndex: number): BoardDefinition {
    const { length } = this._projects;
    if (!isValidIndex(startIndex, length) || !isValidIndex(targetIndex, length)) {
      return new BoardDefinition(this.id, [...this._projects]);
    }
    const reordered = [...this._projects];
    [reordered[startIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[startIndex]];
    return new BoardDefinition(this.id, reordered);
  }

  update(index: number, cell: BoardCell): BoardDefinition {
    if (!isValidIndex(index, this._projects.length)) {
      return new BoardDefinition(this.id, [...this._projects]);
    }
    const updated = [...this._projects];
    updated[index] = { ...cell };
    return new BoardDefinition(this.id, updated);
  }

  toPlain(): { id: string; projects: BoardCell[] } {
    return { id: this.id, projects: [...this._projects] as BoardCell[] };
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
