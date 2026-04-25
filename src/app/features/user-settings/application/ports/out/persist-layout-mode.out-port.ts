import { InjectionToken } from '@angular/core';
import { LayoutMode } from '../../../domain/layout-mode';

export interface PersistLayoutModeOutPort {
  persistLayoutMode(mode: LayoutMode): void;
}

export const PERSIST_LAYOUT_MODE_OUT_PORT = new InjectionToken<PersistLayoutModeOutPort>('PersistLayoutModeOutPort');
