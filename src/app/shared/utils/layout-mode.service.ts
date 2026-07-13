import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export const PHONE_BREAKPOINT = '(max-width: 767px)';

@Injectable({ providedIn: 'root' })
export class LayoutModeService {
  readonly isMobile: Signal<boolean>;

  private readonly mobile: WritableSignal<boolean> = signal(
    typeof window !== 'undefined'
      ? window.matchMedia(PHONE_BREAKPOINT).matches
      : false
  );

  constructor() {
    this.isMobile = this.mobile.asReadonly();

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(PHONE_BREAKPOINT);
      const onChange = () => this.mobile.set(mediaQuery.matches);
      mediaQuery.addEventListener('change', onChange);
    }
  }
}
