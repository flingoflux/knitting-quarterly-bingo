import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageToolbarComponent } from '../../../../shared/ui/common/organisms/page-toolbar/page-toolbar.component';
import { PageContainerComponent } from '../../../../shared/ui/common/templates/page-container/page-container.component';
import { IconComponent } from '../../../../shared/ui/common/atoms/icon/icon.component';
import { ButtonComponent } from '../../../../shared/ui/common/atoms/button/button.component';
import { FeatureHeaderComponent } from '../../../../shared/ui/common/molecules/feature-header/feature-header.component';
import { BoardViewMode } from '../../../user-settings/domain/board-view-mode';
import { LayoutMode } from '../../../user-settings/domain/layout-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../../../user-settings/application/ports/in/manage-user-settings.in-port';
import { StorageService } from '../../../../core/infrastructure/storage.service';
import { IndexedDbImageRepository } from '../../../../core/infrastructure/indexed-db-image-repository.service';
import { LayoutModeService } from '../../../../shared/utils/layout-mode.service';

@Component({
  selector: 'app-how-to',
  standalone: true,
  imports: [PageToolbarComponent, PageContainerComponent, IconComponent, ButtonComponent, FeatureHeaderComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        [maxWidth]="pageToolbarWidth"
        [showQuarterNav]="false"
        (homeClicked)="goHome()"
      >
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <div class="feature-shell">
        <kq-feature-header
          eyebrow="How-to"
          title="Wie funktioniert Knitting Quarterly Bingo?"
          titleTestId="page-howto-title"
        />

        <div class="content">
        <section class="section">
          <h2 class="section-title"><kq-icon name="target" [size]="18"/>Das Konzept</h2>
          <p>
            Knitting Quarterly Bingo bringt spielerische Struktur in dein Strickquartal:
            Alle 3 Monate startet ein neues Board mit 16 Challenges, die dich motivieren und inspirieren.
          </p>
          <p>
            Es geht nicht um Masse, sondern um Momentum. Schon ein Bingo ist ein Erfolg -
            und auch ohne Bingo bleiben fertige Projekte, auf die du stolz sein kannst.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title"><kq-icon name="layers" [size]="18"/>Die Phasen des Spiels</h2>
          <div class="phase-list">
            <div class="phase">
              <div class="phase-name">1. Planen</div>
              <p>
                Richte dein Board wie ein Moodboard ein: Wähle Challenges, suche passende Patterns,
                Wolle oder UFOs und ordne die Felder per Drag &amp; Drop oder Zufall neu.
                Zu jeder Challenge kannst du optional ein Inspirationsfoto speichern.
              </p>
              <p>
                Standardmäßig startet dein Board mit dem nächsten Quartal.
                Mit dem <strong>Play-Button</strong> ▶ kannst du sofort loslegen -
                dabei wird das aktuelle Spiel inklusive Fortschritt überschrieben.
              </p>
            </div>
            <div class="phase">
              <div class="phase-name">2. Spielen</div>
              <p>
                Stricke und hake Challenges ab. Ein Klick auf ein Feld markiert es als erledigt.
                Über die Detailansicht kannst du ein Fortschrittsfoto hochladen und mit deinem
                Planungsfoto vergleichen.
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
          <h2 class="section-title"><kq-icon name="lightbulb" [size]="18"/>Tipps</h2>
          <ul>
            <li>Dein Fortschritt wird <strong>automatisch gespeichert</strong> — kein manuelles Speichern nötig.</li>
            <li>Fotos sollten <strong>quadratisch</strong> sein — beim Hochladen kannst du den Ausschnitt direkt zuschneiden.</li>
            <li>Du kannst vergangene und zukünftige Quartale über die Navigationspfeile in der Toolbar aufrufen.</li>
          </ul>
        </section>

        <section id="settings" class="section settings-section" aria-labelledby="howto-settings-title">
          <h2 id="howto-settings-title" class="section-title"><kq-icon name="settings-feather" [size]="18"/>Einstellungen</h2>
          <p class="settings-intro">
            Passe die Board-Ansicht an oder setze lokale Daten zurück.
          </p>
          <div class="settings-subsection board-view-subsection">
            <h3>Board-Ansicht</h3>
            <p class="view-mode-note">
              Wähle einen Modus. Er gilt sofort für Spielen und Planen.
            </p>
            <div class="mode-options" role="group" aria-label="Board-Ansicht wählen">
              <button
                type="button"
                class="mode-option"
                [class.active]="viewMode === 'polaroid'"
                [attr.aria-pressed]="viewMode === 'polaroid'"
                (click)="onModeChange('polaroid')"
              >
                <span class="mode-option-title"><kq-icon name="polaroid" [size]="16"/>Polaroid</span>
                <span class="mode-option-copy">Zeigt Karten im Polaroid-Look, wie auf einem Moodboard angeordnet.</span>
              </button>

              <button
                type="button"
                class="mode-option"
                [class.active]="viewMode === 'kompakt'"
                [attr.aria-pressed]="viewMode === 'kompakt'"
                (click)="onModeChange('kompakt')"
              >
                <span class="mode-option-title"><kq-icon name="horizontal" [size]="16"/>Kompakt</span>
                <span class="mode-option-copy">Zeigt mehr Felder gleichzeitig für schnellen Überblick.</span>
              </button>
            </div>
          </div>

          <div class="settings-subsection">
            <h3>Darstellungsmodus</h3>
            <p class="view-mode-note">
              Wähle, ob das Board-Layout automatisch nach Bildschirmgröße, immer als Desktop- oder immer als Mobile-Ansicht angezeigt werden soll.
            </p>
            <div class="mode-options layout-mode-options" role="group" aria-label="Darstellungsmodus wählen">
              <button
                type="button"
                class="mode-option"
                [class.active]="layoutMode.layoutMode() === 'auto'"
                [attr.aria-pressed]="layoutMode.layoutMode() === 'auto'"
                (click)="onLayoutModeChange('auto')"
              >
                <span class="mode-option-title"><kq-icon name="target" [size]="16"/>Auto</span>
                <span class="mode-option-copy">Smartphone → Mobile, größere Bildschirme → Desktop.</span>
              </button>

              <button
                type="button"
                class="mode-option"
                [class.active]="layoutMode.layoutMode() === 'desktop'"
                [attr.aria-pressed]="layoutMode.layoutMode() === 'desktop'"
                (click)="onLayoutModeChange('desktop')"
              >
                <span class="mode-option-title"><kq-icon name="horizontal" [size]="16"/>Desktop</span>
                <span class="mode-option-copy">Immer die Desktop-Ansicht — auch auf kleinen Screens.</span>
              </button>

              <button
                type="button"
                class="mode-option"
                [class.active]="layoutMode.layoutMode() === 'mobile'"
                [attr.aria-pressed]="layoutMode.layoutMode() === 'mobile'"
                (click)="onLayoutModeChange('mobile')"
              >
                <span class="mode-option-title"><kq-icon name="polaroid" [size]="16"/>Mobile</span>
                <span class="mode-option-copy">Immer die Mobile-Ansicht — auch auf Desktop.</span>
              </button>
            </div>
          </div>

          <div class="settings-subsection settings-subsection-danger">
            <h3 class="settings-danger-title">
              <kq-icon name="alert-triangle" [size]="18"/> Daten zurücksetzen
            </h3>
            <p class="danger-copy">
              Löscht alle lokalen Daten (Spielstände, Pläne, Archiv, Fotos). Kann nicht rückgängig gemacht werden.
            </p>
            <kq-button data-testid="action-howto-clear-data" variant="ghost" (click)="clearAllData()">Spielstand löschen</kq-button>
          </div>
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

    .settings-section {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid #ead8cb;
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

    .settings-intro {
      margin-bottom: 1rem;
    }

    .settings-subsection {
      margin-top: 1rem;
      padding-top: 0.8rem;
      border-top: 1px solid #ead8cb;
    }

    .settings-subsection h3 {
      margin: 0 0 0.55rem;
      color: #7b371f;
      font-size: 1.05rem;
      font-weight: 600;
    }

    .view-mode-note {
      margin: 0 0 0.9rem;
      color: #5a3c2f;
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .mode-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .mode-option {
      border: 1px solid #ddc7b8;
      border-radius: 12px;
      background: #faf8f6;
      color: #5a2d1a;
      text-align: left;
      padding: 0.8rem 0.85rem;
      cursor: pointer;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .mode-option:hover {
      border-color: #c7936a;
      box-shadow: 0 3px 10px rgba(123, 55, 31, 0.12);
    }

    .mode-option.active {
      border-color: #9f4b27;
      background: #fff2e6;
      box-shadow: 0 0 0 2px rgba(159, 75, 39, 0.18);
    }

    .mode-option:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.35);
      outline-offset: 1px;
    }

    .mode-option-title {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .mode-option-title kq-icon {
      color: #8f4a2b;
      flex-shrink: 0;
    }

    .mode-option-copy {
      font-size: 0.9rem;
      color: #6f4e3f;
      line-height: 1.4;
    }

    .settings-subsection-danger {
      margin-top: 1.2rem;
    }

    .settings-danger-title {
      color: #8b2e0f;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .danger-copy {
      margin: 0 0 1rem;
      color: #6b4035;
      font-size: 0.92rem;
      line-height: 1.5;
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

      .board-view-subsection {
        display: none;
      }

      .mode-options {
        grid-template-columns: 1fr;
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
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);
  private readonly storage = inject(StorageService);
  private readonly imageRepo = inject(IndexedDbImageRepository);
  readonly layoutMode = inject(LayoutModeService);

  readonly pageToolbarWidth = '52rem';
  viewMode: BoardViewMode = this.userSettings.loadBoardViewMode();

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToHelp(): void {
    // Already on help page
  }

  goToSettings(): void {
    void this.router.navigate([], { fragment: 'settings' });
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
  }

  onLayoutModeChange(mode: LayoutMode): void {
    this.layoutMode.persistLayoutMode(mode);
  }

  async clearAllData(): Promise<void> {
    const confirmed = window.confirm(
      'Alle Spielstände, Pläne, Archiv-Einträge und Fotos werden unwiderruflich gelöscht. Fortfahren?'
    );
    if (!confirmed) return;

    this.storage.clearAppData();
    await this.imageRepo.clearAllImages();
    await this.router.navigate(['/']);
  }
}
