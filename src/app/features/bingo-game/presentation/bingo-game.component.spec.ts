import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('BingoGameComponent mobile subtitle regression', () => {
  it('should describe tap-to-flip and long-press-to-complete in mobile overview', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/bingo-game.component.ts'),
      'utf-8'
    );

    expect(source).toContain('Tippe auf eine Zeile zum Abhaken. Kamera für dein Fortschrittsfoto.');
    expect(source).toContain('Tippen dreht um, langes Drücken hakt ab.');
  });
});
