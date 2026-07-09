import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('HowItWorksComponent template regression', () => {
  it('should contain the how-to page heading test id', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    // when
    );
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).toContain('titleTestId="page-howto-title"');
  });

  it('should not render desktop mode toggle settings', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    );

    // when
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).not.toContain('Desktop-Board-Ansicht');
    expect(source).not.toContain("(click)=\"onModeChange('polaroid')\"");
    expect(source).not.toContain("(click)=\"onModeChange('kompakt')\"");
  });

  it('should keep settings section without board-view subsection', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    );

    // when
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).toContain('id="howto-settings-title"');
    expect(source).not.toContain('board-view-subsection');
    expect(source).not.toContain('.layout-mode-subsection');
  });
});
