import { PlayableProject } from './playable-project';

export class PlayableBoard {
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

  // Gibt alle Bingo-Linien (je 4 Indizes) für ein 4x4-Board zurück
  static allBingoLines(): number[][] {
    const lines: number[][] = [];
    // Reihen
    for (let r = 0; r < 4; r++) lines.push([0,1,2,3].map(c => r*4+c));
    // Spalten
    for (let c = 0; c < 4; c++) lines.push([0,1,2,3].map(r => r*4+c));
    // Diagonalen
    lines.push([0,5,10,15]);
    lines.push([3,6,9,12]);
    return lines;
  }

  // Gibt alle Indizes der Zellen zurück, die zu einer vollständigen Bingo-Linie gehören
  getBingoCells(): Set<number> {
    const bingoCells = new Set<number>();
    for (const line of PlayableBoard.allBingoLines()) {
      if (line.every(i => this.done[i])) {
        line.forEach(i => bingoCells.add(i));
      }
    }
    return bingoCells;
  }
}
