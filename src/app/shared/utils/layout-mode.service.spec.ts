import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/app/shared/utils/layout-mode.service.ts'),
  'utf-8'
);

describe('LayoutModeService', () => {
  it('nutzt nur den Phone-Breakpoint für den Mobile-Modus', () => {
    expect(source).toContain("PHONE_BREAKPOINT = '(max-width: 767px)'");
    expect(source).toContain('window.matchMedia(PHONE_BREAKPOINT).matches');
  });

  it('behandelt Tablet nicht mehr als Mobile per Touch-Breakpoint', () => {
    expect(source).not.toContain('TABLET_TOUCH_BREAKPOINT');
  });
});
