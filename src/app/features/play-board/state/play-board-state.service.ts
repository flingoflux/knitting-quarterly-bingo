import { Injectable } from '@angular/core';
import { PlayableBoard } from '../domain/playable-board';
import { BoardCell } from '../../../shared/domain/board-cell';

@Injectable({ providedIn: 'root' })
export class PlayBoardStateService {
  private board: PlayableBoard;

  constructor() {
    // Beispiel: Initialisierung mit Dummy-Daten
    this.board = new PlayableBoard([
      { title: 'Socken stricken', cat: 'Basics', catKey: 'basics' },
      // ...weitere Projekte
    ] as BoardCell[], new Array(16).fill(false), []);
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
