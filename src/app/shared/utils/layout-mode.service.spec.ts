import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/app/shared/utils/layout-mode.service.ts'),
  'utf-8'
);

describe('LayoutModeService – Auto iPad-Erkennung', () => {
  it('Phone-Breakpoint ist auf max-width 767px gesetzt', () => {
    expect(source).toContain("PHONE_BREAKPOINT = '(max-width: 767px)'");
  });

  it('Tablet-Touch-Breakpoint erfasst iPads per any-pointer: coarse bis 1366px', () => {
    expect(source).toContain("TABLET_TOUCH_BREAKPOINT = '(max-width: 1366px) and (any-pointer: coarse)'");
  });

  it('matchesAutoMobileQuery prüft beide Breakpoints per ODER-Verknüpfung', () => {
    expect(source).toContain('matchMedia(PHONE_BREAKPOINT).matches');
    expect(source).toContain('matchMedia(TABLET_TOUCH_BREAKPOINT).matches');
  });

  it('beide Queries werden im Konstruktor als Event-Listener registriert', () => {
    expect(source).toContain("window.matchMedia(PHONE_BREAKPOINT)");
    expect(source).toContain("window.matchMedia(TABLET_TOUCH_BREAKPOINT)");
    expect(source).toContain("addEventListener('change', onChange)");
  });

  it('manueller Override "mobile" gibt true zurück unabhängig von System-Query', () => {
    expect(source).toContain("if (mode === 'mobile') return true;");
  });

  it('manueller Override "desktop" gibt false zurück unabhängig von System-Query', () => {
    expect(source).toContain("if (mode === 'desktop') return false;");
  });

  it('Auto-Modus delegiert an systemIsMobile', () => {
    expect(source).toContain('return this.systemIsMobile();');
  });
});
