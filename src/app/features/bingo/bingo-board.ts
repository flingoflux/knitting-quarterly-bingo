import { Project } from './bingo';

export interface IBingoBoard {
  getProjects(): Project[];
  getDone(): boolean[];
  getBingoLines(): number[][];
}

export class EditableBingoBoard implements IBingoBoard {
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
    this.projects = projects;
  }

  setDone(done: boolean[]) {
    this.done = done;
  }

  setBingoLines(bingoLines: number[][]) {
    this.bingoLines = bingoLines;
  }

  // Drag & Drop Methoden und weitere Editierfunktionen können hier ergänzt werden
}

export class PlayableBingoBoard implements IBingoBoard {
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
