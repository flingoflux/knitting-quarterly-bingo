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
    expect(source).toContain('data-testid="page-howto-title"');
  });
});
