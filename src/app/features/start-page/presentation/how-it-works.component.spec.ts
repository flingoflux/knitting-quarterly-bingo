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

  it('should use kompakt mode toggle and not horizontal', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    );

    // when
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).toContain("(click)=\"onModeChange('kompakt')\"");
    expect(source).not.toContain("(click)=\"onModeChange('horizontal')\"");
  });

  it('should hide board view settings on mobile breakpoint', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    );

    // when
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).toContain('class="settings-subsection board-view-subsection"');
    expect(source).toContain('@media (max-width: 640px)');
    expect(source).toContain('.board-view-subsection');
    expect(source).not.toContain('.layout-mode-subsection');
    expect(source).toContain('display: none;');
  });
});
