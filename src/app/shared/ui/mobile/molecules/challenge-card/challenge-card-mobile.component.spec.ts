import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ChallengeCardMobileComponent regression', () => {
  it('should support long-press to mark challenge done in mobile grid', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/shared/ui/mobile/molecules/challenge-card/challenge-card-mobile.component.ts'),
      'utf-8'
    );

    expect(source).toContain('@Output() longPressed = new EventEmitter<void>();');
    expect(source).toContain('(pointerdown)="onPressStart($event)"');
    expect(source).toContain('(pointerup)="onPressEnd()"');
    expect(source).toContain('(contextmenu)="onContextMenu($event)"');
    expect(source).toContain('this.longPressed.emit();');
    expect(source).toContain('event.preventDefault();');
  });

  it('should keep tap-to-flip behavior for quick taps', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/shared/ui/mobile/molecules/challenge-card/challenge-card-mobile.component.ts'),
      'utf-8'
    );

    expect(source).toContain('(click)="onCardClick()"');
    expect(source).toContain('this.toggleFlip();');
  });
});
