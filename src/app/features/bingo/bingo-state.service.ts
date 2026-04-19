import { Injectable } from '@angular/core';
import { BingoService, Project } from './bingo';

export interface BingoBoardState {
  projects: Project[];
  done: boolean[];
  bingoLines: number[][];
}

@Injectable({ providedIn: 'root' })
export class BingoStateService {
  state: BingoBoardState = {
    projects: [],
    done: [],
    bingoLines: []
  };


  /**
   * Setzt Projekte und Done-Status neu (z.B. nach Drag & Drop) und aktualisiert Bingo-Lines & Persistenz
   */
  setProjectsAndDone(projects: Project[], done: boolean[]) {
    this.state.projects = projects;
    this.state.done = done;
    this.updateBingoLines();
    this.save();
  }

  constructor(
    private bingoService: BingoService
  ) {
    this.load();
  }

  isCellInBingo(index: number): boolean {
    return this.state.bingoLines.some(line => line.includes(index));
  }

  load() {
    const loaded = this.bingoService.load();
    this.state.projects = loaded.projects;
    this.state.done = loaded.done;
    this.updateBingoLines();
  }

  toggle(index: number) {
    this.state.done[index] = !this.state.done[index];
    this.updateBingoLines();
    this.save();
  }

  reset() {
    this.state.done.fill(false);
    this.updateBingoLines();
    this.save();
  }

  shuffle() {
    const newState = this.bingoService.shuffleBoard();
    this.state.projects = newState.projects;
    this.state.done = newState.done;
    this.updateBingoLines();
    this.save();
  }

  private updateBingoLines() {
    this.state.bingoLines = this.bingoService.getBingoLines(this.state.done);
  }

  private save() {
    this.bingoService.save({ projects: this.state.projects, done: this.state.done });
  }

  // Drag & Drop Logik entfernt – bitte in Komponenten oder separatem UI-Service verwenden
}
