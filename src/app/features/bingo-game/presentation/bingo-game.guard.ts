import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BingoGameService } from '../application/bingo-game.service';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { QuarterClock } from '../../../core/domain';

export const bingoGameGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const bingoGameService = inject(BingoGameService);
  const bingoGameRepository = inject(BINGO_GAME_REPOSITORY);
  const router = inject(Router);
  const quarterClock = new QuarterClock();
  const quarterId = route.queryParamMap.get('quarter') ?? quarterClock.getQuarterId(new Date());

  if (route.queryParamMap.get('new') === 'true') {
    bingoGameRepository.clear(quarterId);
  }

  if (bingoGameService.hasPlayableBoard(quarterId)) {
    return true;
  }

  return router.createUrlTree(['/edit']);
};
