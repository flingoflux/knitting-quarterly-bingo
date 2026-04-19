import { describe, expect, it } from 'vitest';
import { canActivatePlayBoardFromState } from './play-board.guard.logic';

describe('playBoardGuard', () => {
  it('aktiviert die Play-Route bei vorhandenem Board', () => {
    expect(canActivatePlayBoardFromState(true)).toBe(true);
  });

  it('blockiert die Play-Route ohne Board', () => {
    expect(canActivatePlayBoardFromState(false)).toBe(false);
  });
});
