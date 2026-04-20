import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BingoGameService } from '../application/bingo-game.service';
import { canActivateBingoGameFromState } from './bingo-game.guard.logic';

export const bingoGameGuard: CanActivateFn = () => {
  const bingoGameService = inject(BingoGameService);
  const router = inject(Router);

  if (canActivateBingoGameFromState(bingoGameService.hasPlayableBoard())) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
