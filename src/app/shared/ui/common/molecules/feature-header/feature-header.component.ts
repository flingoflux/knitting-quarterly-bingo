import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EyebrowComponent } from '../../atoms/eyebrow/eyebrow.component';
import { LayoutModeService } from '../../../../utils/layout-mode.service';

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
 *   />
 *
 * Für Feature-spezifischen Inhalt nach der Subtitle steht <ng-content> zur Verfügung.
 */
@Component({
  selector: 'kq-feature-header',
  standalone: true,
  imports: [CommonModule, EyebrowComponent],
  template: `
    <div class="feature-header" [class.feature-header--mobile]="layoutMode.isMobile()">
      <kq-eyebrow>{{ eyebrow }}</kq-eyebrow>
      <h2 [attr.data-testid]="titleTestId ?? null">{{ title }}</h2>
      <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      <ng-content />
    </div>
  `,
  styles: [`
    .feature-header {
      text-align: center;
        margin-bottom: var(--kq-feature-header-margin-bottom);
        padding: var(--kq-feature-header-padding);
    }

    .feature-header--mobile {
        padding: var(--kq-feature-header-mobile-padding);
        margin-bottom: var(--kq-feature-header-mobile-margin-bottom);
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
  readonly layoutMode = inject(LayoutModeService);

  @Input() eyebrow = '';
  @Input() title = '';
  @Input() titleTestId?: string;
  @Input() subtitle?: string;
}
