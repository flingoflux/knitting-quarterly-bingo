import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlayBoardStateService } from './state/play-board-state.service';
import { canActivatePlayBoardFromState } from './play-board.guard.logic';

export const playBoardGuard: CanActivateFn = () => {
  const playBoardState = inject(PlayBoardStateService);
  const router = inject(Router);

  if (canActivatePlayBoardFromState(playBoardState.hasPlayableBoard())) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
