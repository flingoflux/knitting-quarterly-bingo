import { describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT_MODE, isLayoutMode } from './layout-mode';

describe('LayoutMode', () => {
  it('should default to auto', () => {
    expect(DEFAULT_LAYOUT_MODE).toBe('auto');
  });

  it('should accept auto, desktop and mobile', () => {
    expect(isLayoutMode('auto')).toBe(true);
    expect(isLayoutMode('desktop')).toBe(true);
    expect(isLayoutMode('mobile')).toBe(true);
  });

  it('should reject unknown values', () => {
    expect(isLayoutMode('kompakt')).toBe(false);
    expect(isLayoutMode('')).toBe(false);
    expect(isLayoutMode(null)).toBe(false);
    expect(isLayoutMode(undefined)).toBe(false);
  });
});
