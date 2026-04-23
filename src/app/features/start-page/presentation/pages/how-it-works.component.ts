import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { PageToolbarComponent } from '../../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { PageContainerComponent } from '../../../../shared/ui/templates/page-container/page-container.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PageToolbarComponent, PageContainerComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        [maxWidth]="pageToolbarWidth"
        (homeClicked)="goHome()"
      ></kq-page-toolbar>

      <div class="feature-shell">
        <div class="how-it-works-header">
          <p class="eyebrow">Dokumentation</p>
          <h1>Wie funktioniert Knitting Quarterly Bingo?</h1>
        </div>

        <div class="content">
        <section class="section">
          <h2>🎯 Das Konzept</h2>
          <p>
            Knitting Quarterly Bingo ist ein Langzeitprojekt für Strickfans. Alle 3 Monate (ein Quartal)
            gibt es ein neues Bingo-Board mit 16 Strickprojekten. Deine Aufgabe: Versuche, möglichst viele
            dieser Projekte in einem Quartal zu stricken und erhalte Bingos!
          </p>
        </section>

        <section class="section">
          <h2>📋 Die Phasen eines Quartals</h2>
          <div class="phase-list">
            <div class="phase">
              <div class="phase-name">1. Planung (Wochen 1-2)</div>
              <p>
                Das Board wird veröffentlicht. Du planst deine Projekte und notierst deine Bilder
                zum "Vorher"-Stand jedes Projekts im Board.
              </p>
            </div>
            <div class="phase">
              <div class="phase-name">2. Spielphase (Wochen 3-12)</div>
              <p>
                Es ist Zeit zu stricken! Während du deine Projekte voranbringst, markierst du sie im
                Board als "fertig" und ladest Fotos von deinem Fortschritt hoch.
              </p>
            </div>
            <div class="phase">
              <div class="phase-name">3. Archivierung</div>
              <p>
                Am Ende des Quartals wird dein Board ins Archiv verschoben. Du kannst deine Erfolge
                später anschauen und Statistiken einsehen.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🎲 Bingo gewinnen</h2>
          <p>
            Ein <strong>Bingo</strong> entsteht, wenn du 5 Projekte in einer Reihe, Spalte oder Diagonale
            fertigstellst. Mit jedem abgeschlossenen Projekt kommst du näher zu deinen Bingos!
          </p>
          <p>
            Das Board ist eine 4×4 Matrix, also gibt es 8 mögliche Bingo-Linien:
            <strong>4 Reihen + 4 Spalten = 8 Bingos möglich</strong> (bei 5 Feldern pro Linie).
          </p>
        </section>

        <section class="section">
          <h2>🎮 Wie benutzt du die App?</h2>
          <div class="feature-list">
            <div class="feature">
              <strong>Spielen-Modus:</strong> Markiere deine Fortschritte und lade Fotos hoch.
            </div>
            <div class="feature">
              <strong>Planen-Modus:</strong> Arrangiere deine Projekte im Board und passe sie an.
            </div>
            <div class="feature">
              <strong>Archiv:</strong> Schaue dir deine abgeschlossenen Quartale an.
            </div>
          </div>
        </section>

        <section class="section">
          <h2>💡 Tipps</h2>
          <ul>
            <li>Nutze die <strong>Vorschau</strong>, um dein Board vor dem Spielstart zu überprüfen.</li>
            <li>Du kannst deine Projekte jederzeit verschieben und bearbeiten — solange der Quarter aktiv ist.</li>
            <li>Speichere regelmäßig Fotos deiner Fortschritte, um tolle Erinnerungen festzuhalten.</li>
          </ul>
        </section>

        <div class="cta">
          <kq-button variant="primary" (click)="goHome()">
            Zurück zur Startseite
          </kq-button>
        </div>
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
      margin-top: 2rem;
      display: flex;
      justify-content: center;
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
}
