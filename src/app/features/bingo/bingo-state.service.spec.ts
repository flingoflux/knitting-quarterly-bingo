import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BingoStateService, BingoBoardState } from './bingo-state.service';
import { BingoService } from './bingo';

describe('BingoStateService', () => {

  let bingoServiceMock: BingoService;
  let service: BingoStateService;

  beforeEach(() => {
    bingoServiceMock = {
      load: vi.fn().mockReturnValue({
        projects: [{ title: 'A', cat: 'C', catKey: 'K' }],
        done: [false]
      }),
      save: vi.fn(),
      getBingoLines: vi.fn().mockReturnValue([[0]]),
      shuffleBoard: vi.fn().mockReturnValue({
        projects: [{ title: 'B', cat: 'C', catKey: 'K' }],
        done: [false]
      })
    } as unknown as BingoService;
    service = new BingoStateService(bingoServiceMock);
  });

  it('lädt initialen State', () => {
    expect(service.state.projects.length).toBe(1);
    expect(service.state.done[0]).toBe(false);
    expect(service.state.bingoLines).toEqual([[0]]);
  });

  it('toggle ändert done-Status und speichert', () => {
    service.toggle(0);
    expect(service.state.done[0]).toBe(true);
    expect((bingoServiceMock.save as any)).toHaveBeenCalled();
  });

  it('reset setzt alle done auf false', () => {
    service.state.done = [true];
    service.reset();
    expect(service.state.done[0]).toBe(false);
    expect((bingoServiceMock.save as any)).toHaveBeenCalled();
  });

  it('shuffle aktualisiert Projekte und done', () => {
    service.shuffle();
    expect(service.state.projects[0].title).toBe('B');
    expect((bingoServiceMock.save as any)).toHaveBeenCalled();
  });

  it('setProjectsAndDone setzt State und speichert', () => {
    service.setProjectsAndDone([{ title: 'X', cat: 'Y', catKey: 'Z' }], [true]);
    expect(service.state.projects[0].title).toBe('X');
    expect(service.state.done[0]).toBe(true);
    expect((bingoServiceMock.save as any)).toHaveBeenCalled();
  });
});
