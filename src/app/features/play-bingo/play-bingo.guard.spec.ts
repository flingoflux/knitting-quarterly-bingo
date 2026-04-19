import { describe, expect, it } from 'vitest';
import { canActivatePlayBingoFromState } from './play-bingo.guard.logic';

describe('playBingoGuard', () => {
  it('aktiviert die Play-Route bei vorhandenem Board', () => {
    expect(canActivatePlayBingoFromState(true)).toBe(true);
  });

  it('blockiert die Play-Route ohne Board', () => {
    expect(canActivatePlayBingoFromState(false)).toBe(false);
  });
});
