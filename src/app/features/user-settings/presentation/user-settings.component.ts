import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { BoardViewMode } from '../domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../application/ports/in/manage-user-settings.in-port';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { IndexedDbImageRepository } from '../../../core/infrastructure/indexed-db-image-repository.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [PageContainerComponent, PageToolbarComponent, IconComponent, ButtonComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        quarterLabel="Einstellungen"
        [showPreviousButton]="false"
        [showNextButton]="false"
        (homeClicked)="goHome()"
      >
        <kq-button toolbar-actions testId="action-toolbar-settings" variant="icon" (click)="goToSettings()" title="Einstellungen" ariaLabel="Einstellungen">
          <kq-icon name="settings-feather" [size]="24"/>
        </kq-button>
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <section class="settings-shell" aria-labelledby="settings-title">
        <p class="eyebrow">Knitting Quarterly</p>
        <h2 id="settings-title" data-testid="page-settings-title">Einstellungen</h2>
        <p class="subtitle">
          Passe die Board-Ansicht an oder setze lokale Daten zurueck.
        </p>

        <div class="setting-card">
          <p class="setting-title">Board-Ansicht</p>
          <p class="view-mode-note">
            Waehle einen Modus. Er gilt sofort fuer Spielen und Planen.
          </p>
          <div class="mode-options" role="group" aria-label="Board-Ansicht waehlen">
            <button
              type="button"
              class="mode-option"
              [class.active]="viewMode === 'polaroid'"
              [attr.aria-pressed]="viewMode === 'polaroid'"
              (click)="onModeChange('polaroid')"
            >
              <span class="mode-option-title">Polaroid</span>
              <span class="mode-option-copy">Zeigt Karten im Polaroid-Look, wie auf einem Moodboard angeordnet.</span>
            </button>

            <button
              type="button"
              class="mode-option"
              [class.active]="viewMode === 'horizontal'"
              [attr.aria-pressed]="viewMode === 'horizontal'"
              (click)="onModeChange('horizontal')"
            >
              <span class="mode-option-title">Kompakt</span>
              <span class="mode-option-copy">Zeigt mehr Felder gleichzeitig fuer schnellen Ueberblick.</span>
            </button>
          </div>
        </div>

        <div class="setting-card danger-zone">
          <h3 class="setting-title setting-title-danger">
            <kq-icon name="alert-triangle" [size]="18"/> Daten zuruecksetzen
          </h3>
          <p class="danger-copy">
            Loescht alle lokalen Daten (Spielstaende, Plaene, Archiv, Fotos). Nicht rueckgaengig.
          </p>
          <kq-button data-testid="action-settings-clear-data" variant="ghost" (click)="clearAllData()">Spielstand loeschen</kq-button>
        </div>
      </section>
    </kq-page-container>
  `,
  styles: [`
    .settings-shell {
      max-width: 52rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
    }

    .eyebrow {
      margin: 0;
      color: #8f3b22;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 700;
      text-align: center;
    }

    h2 {
      margin: 0.4rem 0 0;
      font-size: clamp(1.4rem, 2.4vw, 2rem);
      color: #5a2d1a;
      text-align: center;
    }

    .subtitle {
      margin: 0.55rem auto 1rem;
      color: #6c5445;
      font-size: 1rem;
      max-width: 42rem;
      text-align: center;
      line-height: 1.45;
    }

    .setting-card {
      border: 1px solid #e6c8b4;
      border-radius: 16px;
      background: #fff9f2;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .setting-title {
      margin: 0 0 0.65rem;
      color: #5a2d1a;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .view-mode-note {
      margin: 0 0 0.9rem;
      color: #7b5a49;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .mode-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .mode-option {
      border: 1px solid #d9b7a0;
      border-radius: 12px;
      background: #fff;
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
      border-color: #c46e35;
      box-shadow: 0 3px 10px rgba(123, 55, 31, 0.12);
    }

    .mode-option.active {
      border-color: #9f4b27;
      background: #fff4ea;
      box-shadow: 0 0 0 2px rgba(159, 75, 39, 0.18);
    }

    .mode-option:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.35);
      outline-offset: 1px;
    }

    .mode-option-title {
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .mode-option-copy {
      font-size: 0.9rem;
      color: #6f4e3f;
      line-height: 1.4;
    }

    .setting-title-danger {
      color: #8b2e0f;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .danger-zone {
      border-color: #ebd5c5;
      background: #fff6ef;
      margin-top: 0.25rem;
    }

    .danger-copy {
      margin: 0 0 1rem;
      color: #6b4035;
      font-size: 0.92rem;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      .settings-shell {
        padding: 1rem 0.75rem 1.4rem;
      }

      .mode-options {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class UserSettingsComponent {
  private readonly router = inject(Router);
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);
  private readonly storage = inject(StorageService);
  private readonly imageRepo = inject(IndexedDbImageRepository);

  viewMode: BoardViewMode = this.userSettings.loadBoardViewMode();

  goHome(): void {
    void this.router.navigate(['/']);
  }

  goToHelp(): void {
    void this.router.navigate(['/how-it-works']);
  }

  goToSettings(): void {
    // Already on settings page
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
  }

  async clearAllData(): Promise<void> {
    const confirmed = window.confirm(
      'Alle Spielstaende, Plaene, Archiv-Eintraege und Fotos werden unwiderruflich geloescht. Fortfahren?'
    );
    if (!confirmed) return;

    this.storage.clearAppData();
    await this.imageRepo.clearAllImages();
    await this.router.navigate(['/']);
  }
}
