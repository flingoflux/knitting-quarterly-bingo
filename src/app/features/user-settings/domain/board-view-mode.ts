export type BoardViewMode = 'polaroid';

export const DEFAULT_BOARD_VIEW_MODE: BoardViewMode = 'polaroid';

export function isBoardViewMode(value: unknown): value is BoardViewMode {
  return value === 'polaroid';
}
