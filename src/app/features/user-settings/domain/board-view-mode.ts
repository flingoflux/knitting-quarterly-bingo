export type BoardViewMode = 'polaroid' | 'kompakt';

export const DEFAULT_BOARD_VIEW_MODE: BoardViewMode = 'polaroid';

export function isBoardViewMode(value: unknown): value is BoardViewMode {
  return value === 'polaroid' || value === 'kompakt';
}
