import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../features/user-settings/application/ports/in/manage-user-settings.in-port';
import { LayoutMode } from '../../features/user-settings/domain/layout-mode';

export const PHONE_BREAKPOINT = '(max-width: 767px)';
export const TABLET_TOUCH_BREAKPOINT = '(max-width: 1366px) and (any-pointer: coarse)';

@Injectable({ providedIn: 'root' })
export class LayoutModeService {
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);

  readonly layoutMode: WritableSignal<LayoutMode> = signal(this.userSettings.loadLayoutMode());

  private readonly systemIsMobile: WritableSignal<boolean> = signal(
    typeof window !== 'undefined'
      ? this.matchesAutoMobileQuery(window)
      : false
  );

  readonly isMobile: Signal<boolean> = computed(() => {
    const mode = this.layoutMode();
    if (mode === 'mobile') return true;
    if (mode === 'desktop') return false;
    return this.systemIsMobile();
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const phoneMq = window.matchMedia(PHONE_BREAKPOINT);
      const tabletMq = window.matchMedia(TABLET_TOUCH_BREAKPOINT);

      const onChange = () => {
        this.systemIsMobile.set(this.matchesAutoMobileQuery(window));
      };

      phoneMq.addEventListener('change', onChange);
      tabletMq.addEventListener('change', onChange);
    }
  }

  persistLayoutMode(mode: LayoutMode): void {
    this.userSettings.persistLayoutMode(mode);
    this.layoutMode.set(mode);
  }

  private matchesAutoMobileQuery(targetWindow: Window): boolean {
    return (
      targetWindow.matchMedia(PHONE_BREAKPOINT).matches ||
      targetWindow.matchMedia(TABLET_TOUCH_BREAKPOINT).matches
    );
  }
}
