import { EditableProject } from './editable-project';

export class EditableBingoBoard {
  private projects: EditableProject[];

  constructor(projects: EditableProject[]) {
    this.projects = projects;
  }

  getProjects(): EditableProject[] {
    return this.projects;
  }

  setProjects(projects: EditableProject[]) {
    this.projects = projects;
  }

  swapProjects(i: number, j: number) {
    const arr = this.projects;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Methoden für Drag & Drop, Editieren etc. können hier ergänzt werden
}
