import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlayBoardStateService } from './state/play-board-state.service';

export const playBoardGuard: CanActivateFn = () => {
  const playBoardState = inject(PlayBoardStateService);
  const router = inject(Router);

  if (playBoardState.hasPlayableBoard()) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
