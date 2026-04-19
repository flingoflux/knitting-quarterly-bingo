import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlayBingoStateService } from './state/play-bingo-state.service';
import { canActivatePlayBingoFromState } from './play-bingo.guard.logic';

export const playBingoGuard: CanActivateFn = () => {
  const playBingoState = inject(PlayBingoStateService);
  const router = inject(Router);

  if (canActivatePlayBingoFromState(playBingoState.hasPlayableBoard())) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
