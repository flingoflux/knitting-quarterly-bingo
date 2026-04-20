export interface BoardCell {
  title: string;
  imageId?: string;
}

export function isValidBoardCell(cell: unknown): cell is BoardCell {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    typeof (cell as BoardCell).title === 'string' &&
    ((cell as BoardCell).imageId === undefined ||
      typeof (cell as BoardCell).imageId === 'string')
  );
}