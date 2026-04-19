import { Injectable } from '@angular/core';
import { PlayableBoard } from '../domain/playable-board';
import { PlayableProject } from '../domain/playable-project';

@Injectable({ providedIn: 'root' })
export class PlayBoardStateService {
  private board: PlayableBoard;

  constructor() {
    // Beispiel: Initialisierung mit Dummy-Daten
    this.board = new PlayableBoard([
      new PlayableProject('Socken stricken', 'Basics', 'basics'),
      // ...weitere Projekte
    ], new Array(16).fill(false), []);
  }

  getBoard(): PlayableBoard {
    return this.board;
  }

  setBoard(board: PlayableBoard) {
    this.board = board;
  }

  toggle(index: number) {
    this.board.toggle(index);
    // ggf. persistieren
  }
}
