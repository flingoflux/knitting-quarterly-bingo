import { PlayableProject } from './playable-project';

export class PlayableBingoBoard {
  private projects: PlayableProject[];
  private done: boolean[];
  private bingoLines: number[][];

  constructor(projects: PlayableProject[], done: boolean[], bingoLines: number[][]) {
    this.projects = projects;
    this.done = done;
    this.bingoLines = bingoLines;
  }

  getProjects(): PlayableProject[] {
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
}
