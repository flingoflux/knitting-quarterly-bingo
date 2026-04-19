import { BoardCell } from '../../../shared/domain/board-cell';

export class EditableBoard {
  private projects: BoardCell[];

  constructor(projects: BoardCell[]) {
    this.projects = projects;
  }

  getProjects(): BoardCell[] {
    return this.projects;
  }

  setProjects(projects: BoardCell[]) {
    this.projects = projects;
  }

  swapProjects(i: number, j: number) {
    const arr = this.projects;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Methoden für Drag & Drop, Editieren etc. können hier ergänzt werden
}
