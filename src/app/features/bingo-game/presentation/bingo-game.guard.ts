import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BingoGameService } from '../application/bingo-game.service';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';

export const bingoGameGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const bingoGameService = inject(BingoGameService);
  const bingoGameRepository = inject(BINGO_GAME_REPOSITORY);
  const router = inject(Router);

  if (route.queryParamMap.get('new') === 'true') {
    bingoGameRepository.clear();
  }

  if (bingoGameService.hasPlayableBoard()) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
