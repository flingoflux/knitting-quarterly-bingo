import { Injectable } from '@angular/core';
import { BingoService, Project } from './bingo';
import { EditableBingoBoard, PlayableBingoBoard } from './bingo-board';


export type BingoBoardMode = 'edit' | 'play';

export interface BingoBoardState {
  board: EditableBingoBoard | PlayableBingoBoard;
  mode: BingoBoardMode;
}

@Injectable({ providedIn: 'root' })
export class BingoStateService {
  state: BingoBoardState = {
    board: new EditableBingoBoard([], [], []),
    mode: 'edit'
  };


  /**
   * Setzt Projekte und Done-Status neu (z.B. nach Drag & Drop) und aktualisiert Bingo-Lines & Persistenz
   */
  setProjectsAndDone(projects: Project[], done: boolean[]) {
    if (this.state.mode !== 'edit') return;
    if (this.state.board instanceof EditableBingoBoard) {
      this.state.board.setProjects(projects);
      this.state.board.setDone(done);
      this.updateBingoLines();
      this.save();
    }
  }

  constructor(private bingoService: BingoService) {
    this.loadEditable();
  }

  isCellInBingo(index: number): boolean {
    return this.state.board.getBingoLines().some(line => line.includes(index));
  }

  loadEditable() {
    const loaded = this.bingoService.loadEditable();
    if (loaded) {
      this.state.board = new EditableBingoBoard(loaded.projects, loaded.done, this.bingoService.getBingoLines(loaded.done));
    } else {
      const projects = [...this.bingoService.defaultProjects].slice(0, 16);
      const done = new Array(projects.length).fill(false);
      this.state.board = new EditableBingoBoard(projects, done, this.bingoService.getBingoLines(done));
    }
    this.state.mode = 'edit';
    this.updateBingoLines();
  }

  loadPlayable() {
    const loaded = this.bingoService.loadPlayable();
    if (loaded) {
      this.state.board = new PlayableBingoBoard(loaded.projects, loaded.done, this.bingoService.getBingoLines(loaded.done));
      this.state.mode = 'play';
      this.updateBingoLines();
    }
  }

  toggle(index: number) {
    if (this.state.mode !== 'play') return;
    if (this.state.board instanceof PlayableBingoBoard) {
      this.state.board.toggle(index);
      this.updateBingoLines();
      this.save();
    }
  }

  reset() {
    if (this.state.mode === 'edit' && this.state.board instanceof EditableBingoBoard) {
      this.state.board.setDone(new Array(this.state.board.getProjects().length).fill(false));
      this.updateBingoLines();
      this.save();
    }
    if (this.state.mode === 'play' && this.state.board instanceof PlayableBingoBoard) {
      this.state.board = new PlayableBingoBoard(
        this.state.board.getProjects(),
        new Array(this.state.board.getProjects().length).fill(false),
        []
      );
      this.updateBingoLines();
      this.save();
    }
  }

  shuffle() {
    if (this.state.mode !== 'edit') return;
    const newState = this.bingoService.shuffleBoard();
    if (this.state.board instanceof EditableBingoBoard) {
      this.state.board.setProjects(newState.projects);
      this.state.board.setDone(newState.done);
      this.updateBingoLines();
      this.save();
    }
  }

  private updateBingoLines() {
    const done = this.state.board.getDone();
    const bingoLines = this.bingoService.getBingoLines(done);
    if (this.state.board instanceof EditableBingoBoard) {
      this.state.board.setBingoLines(bingoLines);
    } else if (this.state.board instanceof PlayableBingoBoard) {
      // PlayableBingoBoard bekommt neue BingoLines
      (this.state.board as PlayableBingoBoard)["bingoLines"] = bingoLines;
    }
  }

  private save() {
    if (this.state.board instanceof EditableBingoBoard) {
      this.bingoService.saveEditable({ projects: this.state.board.getProjects(), done: this.state.board.getDone() });
    } else if (this.state.board instanceof PlayableBingoBoard) {
      this.bingoService.savePlayable({ projects: this.state.board.getProjects(), done: this.state.board.getDone() });
    }
  }

  startGame() {
    if (this.state.mode === 'edit' && this.state.board instanceof EditableBingoBoard) {
      const newPlayable = new PlayableBingoBoard(
        this.state.board.getProjects(),
        this.state.board.getDone(),
        this.state.board.getBingoLines()
      );
      this.bingoService.savePlayable({
        projects: newPlayable.getProjects(),
        done: newPlayable.getDone(),
      });
      this.state = {
        board: newPlayable,
        mode: 'play',
      };
    }
  }

  // Drag & Drop Logik entfernt – bitte in Komponenten oder separatem UI-Service verwenden
}
