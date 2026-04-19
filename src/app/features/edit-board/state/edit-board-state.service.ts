import { Injectable } from '@angular/core';
import { EditableBoard } from '../domain/editable-board';
import { EditableProject } from '../domain/editable-project';

@Injectable({ providedIn: 'root' })
export class EditBoardStateService {
  private board: EditableBoard;
  private defaultProjects: EditableProject[] = [
    new EditableProject('Socken stricken', 'Basics', 'basics'),
    new EditableProject('Neues Garn', 'Challenge', 'challenge'),
    new EditableProject('Zopfmuster', 'Technik', 'technik'),
    new EditableProject('Schal', 'Accessoire', 'accessoire'),
    new EditableProject('Maschenprobe', 'Basics', 'basics'),
    new EditableProject('Färben', 'Challenge', 'challenge'),
    new EditableProject('Farbverlauf', 'Technik', 'technik'),
    new EditableProject('Spitze', 'Technik', 'technik'),
    new EditableProject('Handschuhe', 'Accessoire', 'accessoire'),
    new EditableProject('Eigenes Muster', 'Challenge', 'challenge'),
    new EditableProject('Rundnadel', 'Basics', 'basics'),
    new EditableProject('Intarsia', 'Technik', 'technik'),
    new EditableProject('Verschenken', 'Challenge', 'challenge'),
    new EditableProject('Restgarn', 'Challenge', 'challenge'),
    new EditableProject('Pullover', 'Basics', 'basics'),
    new EditableProject('Garn wechseln', 'Accessoire', 'accessoire'),
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

  setProjects(projects: EditableProject[]) {
    this.board.setProjects(projects);
    // ggf. persistieren
  }
}
