import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageToolbarComponent } from '../../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { PageContainerComponent } from '../../../../shared/ui/templates/page-container/page-container.component';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';

@Component({
  selector: 'app-how-to',
  standalone: true,
  imports: [PageToolbarComponent, PageContainerComponent, IconComponent, ButtonComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        [maxWidth]="pageToolbarWidth"
        [showQuarterNav]="false"
        (homeClicked)="goHome()"
      >
        <kq-button toolbar-actions testId="action-toolbar-settings" variant="icon" (click)="goToSettings()" title="Einstellungen" ariaLabel="Einstellungen">
          <kq-icon name="settings-feather" [size]="24"/>
        </kq-button>
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <div class="feature-shell">
        <div class="how-it-works-header">
          <p class="eyebrow">How-to</p>
          <h1 data-testid="page-howto-title">Wie funktioniert Knitting Quarterly Bingo?</h1>
        </div>

        <div class="content">
        <section class="section">
          <h2 class="section-title"><kq-icon name="target" [size]="18"/>Das Konzept</h2>
          <p>
            Knitting Quarterly Bingo ist Gamification fürs Stricken. Alle 3 Monate startet ein neues
            Quartal mit einem Board aus 16 Challenges — Strickprojekten, die dich inspirieren und motivieren sollen.
          </p>
          <p>
            Das Ziel ist nicht, möglichst viele Projekte abzuhaken. Es geht darum, durch das Spiel
            in Bewegung zu kommen. Ein einziges Bingo wäre schon ein Erfolg — aber auch wer keins schafft,
            hat trotzdem Projekte fertiggestellt, auf die man stolz sein kann.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title"><kq-icon name="layers" [size]="18"/>Die Phasen des Spiels</h2>
          <div class="phase-list">
            <div class="phase">
              <div class="phase-name">1. Planen</div>
              <p>
                Richte dein Board ein — fast wie ein Moodboard. Wähle Challenges aus, auf die du Lust hast,
                und suche dir passende Patterns, Wolle oder UFOs heraus. Ordne die Felder per
                Drag &amp; Drop an oder würfle sie zufällig. Zu jeder Challenge kannst du
                optional ein Inspirationsfoto hinterlegen.
              </p>
            </div>
            <div class="phase">
              <div class="phase-name">2. Spielen</div>
              <p>
                Stricke und hake Challenges ab. Per Klick auf ein Feld markierst du es als erledigt.
                Per Langklick öffnet sich die Detailansicht, wo du ein Fortschrittsfoto hochladen und
                mit dem Planungsfoto vergleichen kannst.
              </p>
            </div>
            <div class="phase">
              <div class="phase-name">3. Archivieren</div>
              <p>
                Nach dem Quartal wird dein Board automatisch ins Archiv verschoben.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title"><kq-icon name="award" [size]="18"/>Bingo gewinnen</h2>
          <p>
            Ein <strong>Bingo</strong> entsteht, wenn du alle 4 Projekte einer vollständigen
            Reihe, Spalte oder Diagonale abschließt. Es gibt insgesamt <strong>10 mögliche Bingo-Linien</strong>:
            4 Reihen + 4 Spalten + 2 Diagonalen.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title"><kq-icon name="lightbulb" [size]="18"/>Tipps</h2>
          <ul>
            <li>Dein Fortschritt wird <strong>automatisch gespeichert</strong> — kein manuelles Speichern nötig.</li>
            <li>Fotos sollten <strong>quadratisch</strong> sein — beim Hochladen kannst du den Ausschnitt direkt zuschneiden.</li>
            <li>Du kannst vergangene und zukünftige Quartale über die Navigationspfeile in der Toolbar aufrufen.</li>
          </ul>
        </section>
      </div>
    </div>
    </kq-page-container>
  `,
  styles: [`
    .feature-shell {
      max-width: none;
      width: 100%;
      margin: 0;
      padding: 1.4rem 1.1rem 2rem;
    }

    .how-it-works-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .eyebrow {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #c7936a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      color: #7b371f;
      font-weight: 700;
    }

    .content {
      width: 100%;
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(123, 55, 31, 0.1);
      box-sizing: border-box;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section:last-of-type {
      margin-bottom: 1.5rem;
    }

    h2 {
      font-size: 1.3rem;
      color: #7b371f;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .section-title {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title kq-icon {
      color: #9a5b34;
      flex-shrink: 0;
    }

    p {
      color: #4a3728;
      line-height: 1.6;
      margin: 0 0 0.8rem 0;
    }

    p:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #5b2c1f;
      font-weight: 600;
    }

    .phase-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .phase {
      padding: 1rem;
      background: #faf8f6;
      border-left: 4px solid #c7936a;
      border-radius: 4px;
    }

    .phase-name {
      font-weight: 600;
      color: #7b371f;
      margin-bottom: 0.5rem;
    }

    .phase p {
      margin: 0;
      color: #5a3c2f;
      font-size: 0.95rem;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .feature {
      padding: 0.8rem;
      background: #faf8f6;
      border-radius: 4px;
      color: #4a3728;
      font-size: 0.95rem;
    }

    ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #4a3728;
      line-height: 1.8;
    }

    li {
      margin-bottom: 0.6rem;
    }

    li:last-child {
      margin-bottom: 0;
    }

    .cta {
      display: none;
    }

    @media (max-width: 640px) {
      .feature-shell {
        padding: 1rem;
      }

      .content {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.4rem;
      }

      .how-it-works-header {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class HowItWorksComponent {
  private readonly router = inject(Router);

  readonly pageToolbarWidth = '52rem';

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToHelp(): void {
    // Already on help page
  }

  goToSettings(): void {
    void this.router.navigate(['/settings']);
  }
}
