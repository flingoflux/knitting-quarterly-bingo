import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('PrintBingoBoardComponent regression', () => {
  it('should map query mode via isBoardViewMode with polaroid fallback', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/print-bingo-board.component.ts'),
      'utf-8'
    );

    expect(source).toContain("const resolvedMode = isBoardViewMode(modeParam) ? modeParam : 'polaroid';");
  });

  it('should use landscape orientation for kompakt and portrait otherwise', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/print-bingo-board.component.ts'),
      'utf-8'
    );

    expect(source).toContain("const orientation = this.mode() === 'kompakt' ? 'landscape' : 'portrait';");
    expect(source).toContain("styleElement.textContent = `@page { size: A4 ${orientation}; margin: 12mm; }`;");
  });

  it('should clean up orientation style after print', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/features/bingo-game/presentation/print-bingo-board.component.ts'),
      'utf-8'
    );

    expect(source).toContain("@HostListener('window:afterprint')");
    expect(source).toContain('onAfterPrint(): void {');
    expect(source).toContain('this.removeOrientationStyle();');
  });
});
