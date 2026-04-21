import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { QuarterClock } from '../domain/quarter-clock';

export const quarterNavigationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const quarterId = route.queryParamMap.get('quarter');
  if (!quarterId) {
    return true;
  }

  const returnTo = route.data['returnTo'] === 'edit' ? 'edit' : 'play';
  const quarterClock = new QuarterClock();
  const currentQuarterId = quarterClock.getQuarterId(new Date());

  if (!quarterClock.isPastQuarter(quarterId, currentQuarterId)) {
    return true;
  }

  return inject(Router).createUrlTree(['/archive'], {
    queryParams: { returnTo },
  });
};
