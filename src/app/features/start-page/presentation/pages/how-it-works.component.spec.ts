import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('HowItWorksComponent clearAllData regression', () => {
  it('should use router navigation when clearing all data', () => {
    // given
    const componentPath = resolve(
      process.cwd(),
      'src/app/features/start-page/presentation/pages/how-it-works.component.ts'
    // when
    );
    const source = readFileSync(componentPath, 'utf-8');

    // then
    expect(source).toContain("await this.router.navigate(['/']);");
    expect(source).not.toContain("window.location.href = '/';");
  });
});
