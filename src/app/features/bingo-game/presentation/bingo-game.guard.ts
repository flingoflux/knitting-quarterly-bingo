import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BingoGameService } from '../application/bingo-game.service';

export const bingoGameGuard: CanActivateFn = () => {
  const bingoGameService = inject(BingoGameService);
  const router = inject(Router);

  if (bingoGameService.hasPlayableBoard()) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
