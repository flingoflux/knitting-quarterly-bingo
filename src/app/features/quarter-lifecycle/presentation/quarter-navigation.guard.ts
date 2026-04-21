import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { QuarterClock } from '../../../core/domain';

export const quarterNavigationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const returnTo = route.data['returnTo'] === 'edit' ? 'edit' : 'play';
  const quarterClock = new QuarterClock();
  const currentQuarterId = quarterClock.getQuarterId(new Date());
  const quarterId = route.queryParamMap.get('quarter');

  if (!quarterId) {
    const targetQuarterId = returnTo === 'edit'
      ? quarterClock.getNextQuarterIdFromQuarterId(currentQuarterId)
      : currentQuarterId;

    return inject(Router).createUrlTree([`/${returnTo}`], {
      queryParams: {
        ...route.queryParams,
        quarter: targetQuarterId,
      },
    });
  }

  if (!quarterClock.isPastQuarter(quarterId, currentQuarterId)) {
    return true;
  }

  return inject(Router).createUrlTree(['/archive'], {
    queryParams: { returnTo },
  });
};
