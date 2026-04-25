import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EyebrowComponent } from '../../atoms/eyebrow/eyebrow.component';

/**
 * Molecule: Seitenheader-Block aus Eyebrow, Überschrift und optionaler Subline.
 * Wird von Feature-Pages (Bingo, Planung, Archiv) als zentraler Inhaltsheader genutzt.
 *
 * Verwendung:
 *   <kq-feature-header
 *     eyebrow="Knitting Quarterly – Bingo"
 *     title="Happy crafting"
 *     subtitle="Klicke auf die Felder..."
 *     titleTestId="page-bingo-title"
 *     [compact]="viewMode === 'kompakt'"
 *   />
 *
 * Für Feature-spezifischen Inhalt nach der Subtitle steht <ng-content> zur Verfügung.
 */
@Component({
  selector: 'kq-feature-header',
  standalone: true,
  imports: [CommonModule, EyebrowComponent],
  template: `
    <div class="feature-header" [class.feature-header--compact]="compact">
      <kq-eyebrow>{{ eyebrow }}</kq-eyebrow>
      <h2 [attr.data-testid]="titleTestId ?? null">{{ title }}</h2>
      <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      <ng-content />
    </div>
  `,
  styles: [`
    .feature-header {
      text-align: center;
      margin-bottom: 1.1rem;
      padding: 0.6rem 0.4rem;
    }

    .feature-header--compact {
      padding: 0.2rem 0.4rem 0.4rem;
      margin-bottom: 0.5rem;
    }

    h2 {
      margin: 0.4rem 0 0;
      font-size: clamp(1.6rem, 2.6vw, 2.2rem);
      color: var(--kq-text-heading, var(--kq-text-heading));
      text-wrap: balance;
    }

    .subtitle {
      color: var(--kq-muted);
      font-size: 1.03rem;
      max-width: 44rem;
      margin: 0.55rem auto 0;
    }
  `],
})
export class FeatureHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() titleTestId?: string;
  @Input() subtitle?: string;
  @Input() compact = false;
}
