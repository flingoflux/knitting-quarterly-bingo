export type BoardViewMode = 'polaroid' | 'horizontal';

export const DEFAULT_BOARD_VIEW_MODE: BoardViewMode = 'polaroid';

export function isBoardViewMode(value: unknown): value is BoardViewMode {
  return value === 'polaroid' || value === 'horizontal';
}
