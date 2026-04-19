import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BoardStoreService } from '../../core/services/board-store.service';
import { canActivatePlayBoardFromState } from './play-board.guard.logic';

export const playBoardGuard: CanActivateFn = () => {
  const boardStore = inject(BoardStoreService);
  const router = inject(Router);

  if (canActivatePlayBoardFromState(boardStore.hasProjects())) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
