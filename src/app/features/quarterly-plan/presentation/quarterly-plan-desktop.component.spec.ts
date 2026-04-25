import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('QuarterlyPlanDesktopComponent desktop header regression', () => {
  it('should use the same header subtitle independent of desktop board mode', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/features/quarterly-plan/presentation/desktop/quarterly-plan-desktop.component.ts'),
      'utf-8'
    );

    expect(source).toContain('subtitle="Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden."');
    expect(source).not.toContain("viewMode === 'polaroid'");
  });
});