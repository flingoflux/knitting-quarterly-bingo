import { describe, expect, it } from 'vitest';
import { canActivateBingoGameFromState } from './bingo-game.guard.logic';

describe('bingoGameGuard', () => {
  it('aktiviert die Play-Route bei vorhandenem Board', () => {
    expect(canActivateBingoGameFromState(true)).toBe(true);
  });

  it('blockiert die Play-Route ohne Board', () => {
    expect(canActivateBingoGameFromState(false)).toBe(false);
  });
});
