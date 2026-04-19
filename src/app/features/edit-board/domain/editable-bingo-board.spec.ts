import { describe, it, expect } from 'vitest';
import { EditableBingoBoard } from './editable-bingo-board';
import { EditableProject } from './editable-project';

describe('EditableBingoBoard', () => {
  function createProjects(): EditableProject[] {
    return Array.from({ length: 16 }, (_, i) => new EditableProject('P' + i, 'Cat', 'cat'));
  }

  it('liefert die Projekte korrekt zurück', () => {
    const projects = createProjects();
    const board = new EditableBingoBoard(projects);
    expect(board.getProjects()).toEqual(projects);
  });

  it('setzt Projekte neu', () => {
    const board = new EditableBingoBoard(createProjects());
    const newProjects = createProjects().reverse();
    board.setProjects(newProjects);
    expect(board.getProjects()).toEqual(newProjects);
  });

  it('tauscht zwei Projekte mit swapProjects', () => {
    const projects = createProjects();
    const board = new EditableBingoBoard([...projects]);
    board.swapProjects(0, 1);
    expect(board.getProjects()[0]).toEqual(projects[1]);
    expect(board.getProjects()[1]).toEqual(projects[0]);
  });
});
