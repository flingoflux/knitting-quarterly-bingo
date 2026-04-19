import { describe, it, expect } from 'vitest';
import { PlayableBoard } from './playable-board';
import { BoardCell } from '../../../shared/domain/board-cell';

describe('PlayableBoard', () => {
  function createProjects(): BoardCell[] {
    return Array.from({ length: 16 }, (_, i) => ({ title: 'P' + i, cat: 'Cat', catKey: 'cat' }));
  }

  it('initialisiert mit allen Feldern offen', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    expect(board.getDone().every(d => d === false)).toBe(true);
  });

  it('toggle setzt und entfernt Haken', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    board.toggle(2);
    expect(board.getDone()[2]).toBe(true);
    board.toggle(2);
    expect(board.getDone()[2]).toBe(false);
  });

  it('erkennt Bingo in Zeile', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    [0,1,2,3].forEach(i => board.toggle(i));
    expect(board.getBingoCells()).toEqual(new Set([0,1,2,3]));
  });

  it('erkennt Bingo in Spalte', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    [1,5,9,13].forEach(i => board.toggle(i));
    expect(board.getBingoCells()).toEqual(new Set([1,5,9,13]));
  });

  it('erkennt Bingo auf Diagonale', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    [0,5,10,15].forEach(i => board.toggle(i));
    expect(board.getBingoCells()).toEqual(new Set([0,5,10,15]));
  });

  it('liefert leere Menge, wenn kein Bingo', () => {
    const board = new PlayableBoard(createProjects(), new Array(16).fill(false), []);
    board.toggle(0);
    expect(board.getBingoCells().size).toBe(0);
  });
});
