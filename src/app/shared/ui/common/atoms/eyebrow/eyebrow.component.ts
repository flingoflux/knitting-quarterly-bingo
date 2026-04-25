import { Component } from '@angular/core';

/**
 * Atom: Overline-Text über einem Seitenheader.
 * Erscheint in Großbuchstaben mit weitem Buchstabenabstand.
 *
 * Verwendung:
 *   <kq-eyebrow>Knitting Quarterly – Bingo</kq-eyebrow>
 */
@Component({
  selector: 'kq-eyebrow',
  standalone: true,
  template: `<p class="eyebrow"><ng-content /></p>`,
  styles: [`
    .eyebrow {
      margin: 0;
      color: var(--kq-primary);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 700;
    }
  `],
})
export class EyebrowComponent {}
