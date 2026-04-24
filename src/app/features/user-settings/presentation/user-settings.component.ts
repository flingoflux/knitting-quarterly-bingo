import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BoardToolbarComponent } from '../../../shared/ui/organisms/board-toolbar/board-toolbar.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { BoardViewMode } from '../domain/board-view-mode';
import { MANAGE_USER_SETTINGS_IN_PORT } from '../application/ports/in/manage-user-settings.in-port';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [PageContainerComponent, PageToolbarComponent, BoardToolbarComponent, IconComponent, ButtonComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        quarterLabel="Einstellungen"
        [showPreviousButton]="false"
        [showNextButton]="false"
        (homeClicked)="goHome()"
      >
        <kq-button toolbar-actions testId="action-toolbar-help" variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <section class="settings-shell" aria-labelledby="settings-title">
        <p class="eyebrow">Knitting Quarterly - User Settings</p>
        <h2 id="settings-title" data-testid="page-settings-title">Board Ansicht</h2>
        <p class="subtitle">
          Waehle, wie Bingo-Boards standardmaessig dargestellt werden. Die Auswahl gilt fuer Spielen und Planen.
        </p>

        <div class="setting-card">
          <p class="setting-title">View Mode</p>
          <kq-board-toolbar [mode]="viewMode" (modeChange)="onModeChange($event)"></kq-board-toolbar>
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
    }

    .setting-title {
      margin: 0 0 0.65rem;
      color: #5a2d1a;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    @media (max-width: 640px) {
      .settings-shell {
        padding: 1rem 0.75rem 1.4rem;
      }
    }
  `],
})
export class UserSettingsComponent {
  private readonly router = inject(Router);
  private readonly userSettings = inject(MANAGE_USER_SETTINGS_IN_PORT);

  viewMode: BoardViewMode = this.userSettings.loadBoardViewMode();

  goHome(): void {
    void this.router.navigate(['/']);
  }

  goToHelp(): void {
    void this.router.navigate(['/how-it-works']);
  }

  onModeChange(mode: BoardViewMode): void {
    this.viewMode = mode;
    this.userSettings.persistBoardViewMode(mode);
  }
}
