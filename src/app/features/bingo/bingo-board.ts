import { Project } from './bingo';

export class EditableBingoBoard {
  private projects: Project[];
  private done: boolean[];
  private bingoLines: number[][];

  constructor(projects: Project[], done: boolean[], bingoLines: number[][]) {
    this.projects = projects;
    this.done = done;
    this.bingoLines = bingoLines;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getDone(): boolean[] {
    return this.done;
  }

  getBingoLines(): number[][] {
    return this.bingoLines;
  }

  setProjects(projects: Project[]) {
    this.projects.splice(0, this.projects.length, ...projects);
  }

  setDone(done: boolean[]) {
    this.done.splice(0, this.done.length, ...done);
  }

  setBingoLines(bingoLines: number[][]) {
    this.bingoLines = bingoLines;
  }

  // Drag & Drop Methoden und weitere Editierfunktionen können hier ergänzt werden
}

export class PlayableBingoBoard {
  private projects: Project[];
  private done: boolean[];
  private bingoLines: number[][];

  constructor(projects: Project[], done: boolean[], bingoLines: number[][]) {
    this.projects = projects;
    this.done = done;
    this.bingoLines = bingoLines;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getDone(): boolean[] {
    return this.done;
  }

  getBingoLines(): number[][] {
    return this.bingoLines;
  }

  toggle(index: number) {
    this.done[index] = !this.done[index];
  }

  // Keine Methoden für Drag & Drop oder Editieren
}
