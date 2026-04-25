import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../features/user-settings/application/ports/in/manage-user-settings.in-port';
import { LayoutMode } from '../../features/user-settings/domain/layout-mode';

const MOBILE_BREAKPOINT = '(max-width: 640px)';

@Injectable({ providedIn: 'root' })
export class LayoutModeService {
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);

  readonly layoutMode: WritableSignal<LayoutMode> = signal(this.userSettings.loadLayoutMode());

  private readonly systemIsMobile: WritableSignal<boolean> = signal(
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_BREAKPOINT).matches
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
      const mq = window.matchMedia(MOBILE_BREAKPOINT);
      mq.addEventListener('change', (e) => {
        this.systemIsMobile.set(e.matches);
      });
    }
  }

  persistLayoutMode(mode: LayoutMode): void {
    this.userSettings.persistLayoutMode(mode);
    this.layoutMode.set(mode);
  }
}
