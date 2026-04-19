import { BingoService } from './bingo';

describe('BingoService', () => {
  let service: BingoService;

  beforeEach(() => {
    service = new BingoService();
  });

  it('should create default state', () => {
    const state = service.load();
    expect(state.projects.length).toBe(16);
    expect(state.done.length).toBe(16);
  });

  it('should shuffle board', () => {
    const state1 = service.shuffleBoard();
    const state2 = service.shuffleBoard();
    expect(state1.projects).not.toEqual(state2.projects);
  });

  it('should detect bingo lines', () => {
    const done = new Array(16).fill(false);
    done[0] = done[1] = done[2] = done[3] = true;
    const lines = service.getBingoLines(done);
    expect(lines.length).toBeGreaterThan(0);
  });
});
