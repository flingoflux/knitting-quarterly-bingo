import { describe, expect, it } from 'vitest';
import { DEFAULT_BOARD_VIEW_MODE, isBoardViewMode } from './board-view-mode';

describe('BoardViewMode', () => {
  it('should default to polaroid', () => {
    expect(DEFAULT_BOARD_VIEW_MODE).toBe('polaroid');
  });

  it('should accept polaroid and kompakt', () => {
    expect(isBoardViewMode('polaroid')).toBe(true);
    expect(isBoardViewMode('kompakt')).toBe(true);
  });

  it('should reject horizontal and unknown values', () => {
    expect(isBoardViewMode('horizontal')).toBe(false);
    expect(isBoardViewMode('')).toBe(false);
    expect(isBoardViewMode(null)).toBe(false);
    expect(isBoardViewMode(undefined)).toBe(false);
  });
});
