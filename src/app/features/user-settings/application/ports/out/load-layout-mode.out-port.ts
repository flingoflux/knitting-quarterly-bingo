import { InjectionToken } from '@angular/core';
import { LayoutMode } from '../../../domain/layout-mode';

export interface LoadLayoutModeOutPort {
  loadLayoutMode(): LayoutMode;
}

export const LOAD_LAYOUT_MODE_OUT_PORT = new InjectionToken<LoadLayoutModeOutPort>('LoadLayoutModeOutPort');
