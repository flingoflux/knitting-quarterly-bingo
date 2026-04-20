export interface Challenge {
  name: string;
  imageId?: string;
}

export function isValidChallenge(cell: unknown): cell is Challenge {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    typeof (cell as Challenge).name === 'string' &&
    ((cell as Challenge).imageId === undefined ||
      typeof (cell as Challenge).imageId === 'string')
  );
}