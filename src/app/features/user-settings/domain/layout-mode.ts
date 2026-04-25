export type LayoutMode = 'auto' | 'desktop' | 'mobile';

export const DEFAULT_LAYOUT_MODE: LayoutMode = 'auto';

export function isLayoutMode(value: unknown): value is LayoutMode {
  return value === 'auto' || value === 'desktop' || value === 'mobile';
}
