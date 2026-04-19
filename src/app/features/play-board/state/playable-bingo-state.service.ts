import { Injectable } from '@angular/core';
import { PlayableBingoBoard } from '../domain/playable-bingo-board';
import { PlayableProject } from '../domain/playable-project';

@Injectable({ providedIn: 'root' })
export class PlayableBingoStateService {
  private board: PlayableBingoBoard;

  constructor() {
    // Beispiel: Initialisierung mit Dummy-Daten
    this.board = new PlayableBingoBoard([
      new PlayableProject('Socken stricken', 'Basics', 'basics'),
      // ...weitere Projekte
    ], new Array(16).fill(false), []);
  }

  getBoard(): PlayableBingoBoard {
    return this.board;
  }

  setBoard(board: PlayableBingoBoard) {
    this.board = board;
  }

  toggle(index: number) {
    this.board.toggle(index);
    // ggf. persistieren
  }
}
