import { Injectable } from '@angular/core';
import { EditableBoard } from '../domain/editable-board';
import { BoardCell } from '../../../shared/domain/board-cell';

@Injectable({ providedIn: 'root' })
export class EditBoardStateService {
  private board: EditableBoard;
  private defaultProjects: BoardCell[] = [
    { title: 'Socken stricken', cat: 'Basics', catKey: 'basics' },
    { title: 'Neues Garn', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Zopfmuster', cat: 'Technik', catKey: 'technik' },
    { title: 'Schal', cat: 'Accessoire', catKey: 'accessoire' },
    { title: 'Maschenprobe', cat: 'Basics', catKey: 'basics' },
    { title: 'Färben', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Farbverlauf', cat: 'Technik', catKey: 'technik' },
    { title: 'Spitze', cat: 'Technik', catKey: 'technik' },
    { title: 'Handschuhe', cat: 'Accessoire', catKey: 'accessoire' },
    { title: 'Eigenes Muster', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Rundnadel', cat: 'Basics', catKey: 'basics' },
    { title: 'Intarsia', cat: 'Technik', catKey: 'technik' },
    { title: 'Verschenken', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Restgarn', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Pullover', cat: 'Basics', catKey: 'basics' },
    { title: 'Garn wechseln', cat: 'Accessoire', catKey: 'accessoire' },
  ];

  constructor() {
    this.board = new EditableBoard([...this.defaultProjects]);
  }

  resetBoard() {
    this.board = new EditableBoard([...this.defaultProjects]);
  }

  getBoard(): EditableBoard {
    return this.board;
  }

  setProjects(projects: BoardCell[]) {
    this.board.setProjects(projects);
    // ggf. persistieren
  }
}
