import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('BingoGameComponent mobile subtitle regression', () => {
  it('should read mobile subtitle texts from BingoBoardMobileComponent constants', () => {
    const gameSource = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/bingo-game.component.ts'),
      'utf-8'
    );
    const mobileSource = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/mobile/bingo-board-mobile.component.ts'),
      'utf-8'
    );

    expect(gameSource).toContain('BingoBoardMobileComponent.editSubtitle');
    expect(gameSource).toContain('BingoBoardMobileComponent.overviewSubtitle');
    expect(mobileSource).toContain("static readonly editSubtitle = 'Tippe auf eine Zeile zum Abhaken. Kamera für dein Fortschrittsfoto.';");
    expect(mobileSource).toContain("static readonly overviewSubtitle = 'Tippen dreht um, langes Drücken hakt ab.';");
  });
});
