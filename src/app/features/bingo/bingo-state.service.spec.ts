import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BingoStateService, BingoBoardState } from './bingo-state.service';
import { BingoService } from './bingo';

describe('BingoStateService', () => {

  let bingoServiceMock: BingoService;
  let service: BingoStateService;

  beforeEach(() => {
    bingoServiceMock = {
      loadEditable: vi.fn().mockReturnValue({
        projects: [{ title: 'A', cat: 'C', catKey: 'K' }],
        done: [false]
      }),
      saveEditable: vi.fn(),
      loadPlayable: vi.fn().mockReturnValue({
        projects: [{ title: 'A', cat: 'C', catKey: 'K' }],
        done: [false]
      }),
      savePlayable: vi.fn(),
      getBingoLines: vi.fn().mockReturnValue([[0]]),
      shuffleBoard: vi.fn().mockReturnValue({
        projects: [{ title: 'B', cat: 'C', catKey: 'K' }],
        done: [false]
      })
    } as unknown as BingoService;
    service = new BingoStateService(bingoServiceMock);
  });

  it('lädt initialen State', () => {
    expect(service.state.board.getProjects().length).toBe(1);
    expect(service.state.board.getDone()[0]).toBe(false);
    expect(service.state.board.getBingoLines()).toEqual([[0]]);
  });

  it('toggle ändert done-Status und speichert', () => {
    service.startGame();
    service.toggle(0);
    expect(service.state.board.getDone()[0]).toBe(true);
    expect((bingoServiceMock.savePlayable as any)).toHaveBeenCalled();
  });

  it('reset setzt alle done auf false', () => {
    service.state.board.setDone([true]);
    service.reset();
    expect(service.state.board.getDone()[0]).toBe(false);
    expect((bingoServiceMock.saveEditable as any)).toHaveBeenCalled();
  });

  it('shuffle aktualisiert Projekte und done', () => {
    service.shuffle();
    expect(service.state.board.getProjects()[0].title).toBe('B');
    expect((bingoServiceMock.saveEditable as any)).toHaveBeenCalled();
  });

  it('setProjectsAndDone setzt State und speichert', () => {
    service.setProjectsAndDone([{ title: 'X', cat: 'Y', catKey: 'Z' }], [true]);
    expect(service.state.board.getProjects()[0].title).toBe('X');
    expect(service.state.board.getDone()[0]).toBe(true);
    expect((bingoServiceMock.saveEditable as any)).toHaveBeenCalled();
  });
});
