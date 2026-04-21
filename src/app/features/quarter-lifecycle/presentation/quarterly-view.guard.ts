import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { QuarterClock } from '../../../core/domain';

/**
 * Zentrale Guard für Quarterly-Views (play, edit).
 * Setzt Standard-Quarter basierend auf viewMode und redirected Past-Quarters zum Archiv.
 */
export const quarterlyViewGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const viewMode = route.data['viewMode'] as 'play' | 'edit';
  const quarterClock = new QuarterClock();
  const currentQuarterId = quarterClock.getQuarterId(new Date());
  const quarterId = route.queryParamMap.get('quarter');

  // Kein Quarter-Parameter → Standardwert setzen
  if (!quarterId) {
    const defaultQuarterId = viewMode === 'edit'
      ? quarterClock.getNextQuarterIdFromQuarterId(currentQuarterId)
      : currentQuarterId;

    return inject(Router).createUrlTree([`/${viewMode}`], {
      queryParams: {
        ...route.queryParams,
        quarter: defaultQuarterId,
      },
    });
  }

  // Quarter liegt in der Vergangenheit → Archiv
  if (quarterClock.isPastQuarter(quarterId, currentQuarterId)) {
    return inject(Router).createUrlTree(['/archive'], {
      queryParams: { returnTo: viewMode },
    });
  }

  return true;
};
