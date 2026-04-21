import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchiveOverviewService } from '../application/archive-overview.service';
import { ArchiveEntry } from '../domain/archive-entry';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="feature-shell">
      <header class="top-row">
        <div class="top-row-left">
          <kq-button variant="icon" (click)="goHome()" title="Zur Startseite" ariaLabel="Zur Startseite">
            <kq-icon name="home" [size]="22"/>
          </kq-button>
        </div>

        <div class="top-row-center">
          <div class="quarter-nav">
            <span class="nav-placeholder" aria-hidden="true"></span>
            <span class="quarter-label">Archiv</span>
            <kq-button
              variant="icon"
              (click)="goToCurrentQuarter()"
              [title]="returnTarget === 'edit' ? 'Zum aktuellen Planungsquartal' : 'Zum aktuellen Spielquartal'"
              [ariaLabel]="returnTarget === 'edit' ? 'Zum aktuellen Planungsquartal' : 'Zum aktuellen Spielquartal'"
            >
              <kq-icon name="chevron-right" [size]="20"/>
            </kq-button>
          </div>
        </div>

        <div class="top-row-right"></div>
      </header>

      <section class="archive-header">
        <p class="eyebrow">Knitting Quarterly - Archiv</p>
        <h2>Bisher erledigte Runden</h2>
        <p class="subtitle">Miniuebersicht abgeschlossener Bingo-Boards.</p>
        <p class="prototype-note" *ngIf="isShowingPrototype()">
          Vorschau mit Beispiel-Boards, bis echte Quartale archiviert wurden.
        </p>
      </section>

      <section *ngIf="hasEntries(); else emptyState" class="archive-list" aria-label="Archivierte Quartale">
        <article class="archive-card" *ngFor="let entry of entries()">
          <header class="card-header">
            <h3>{{ entry.quarterId }}</h3>
            <span class="badge" [class.badge--success]="entry.hasBingo">
              {{ entry.hasBingo ? 'Bingo geschafft' : 'Kein Bingo' }}
            </span>
          </header>
          <p class="meta">{{ entry.completedCount }}/{{ entry.totalCount }} Challenges erledigt</p>
          <p class="meta" *ngIf="entry.completedChallengeNames.length > 0">
            Erledigt: {{ completedPreview(entry) }}
          </p>
          <p class="meta" *ngIf="entry.completedChallengeNames.length === 0">Noch keine erledigten Challenges.</p>
        </article>
      </section>

      <ng-template #emptyState>
        <section class="empty-state">
          <p>Noch keine archivierten Runden vorhanden.</p>
        </section>
      </ng-template>
    </div>
  `,
  styles: [`
    .feature-shell {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
      color: #412a22;
    }

    .top-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
    }

    .top-row-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .top-row-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .top-row-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .quarter-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .nav-placeholder {
      width: 42px;
      height: 42px;
      visibility: hidden;
    }

    .quarter-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 10.5rem;
      height: 42px;
      border-radius: 999px;
      border: 1px solid #c79362;
      background: #fff7ec;
      color: #7b371f;
      font-size: 0.84rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .archive-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .eyebrow {
      margin: 0;
      color: #8f3b22;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 700;
    }

    h2 {
      margin: 0.4rem 0 0;
      font-size: clamp(1.4rem, 2.5vw, 2rem);
      color: #5a2d1a;
      text-wrap: balance;
    }

    .subtitle {
      margin: 0.55rem auto 0;
      color: #6c5445;
      font-size: 0.98rem;
      max-width: 36rem;
    }

    .prototype-note {
      margin: 0.65rem auto 0;
      max-width: 32rem;
      color: #8a3d23;
      font-size: 0.88rem;
      line-height: 1.4;
      background: #fff3e6;
      border: 1px solid #ebc4ac;
      border-radius: 999px;
      padding: 0.42rem 0.85rem;
    }

    .archive-list {
      display: grid;
      gap: 0.75rem;
      max-width: 52rem;
      margin: 0 auto;
    }

    .archive-card {
      border: 1px solid #e6c8b4;
      border-radius: 16px;
      background: #fff9f2;
      padding: 0.85rem 0.95rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
      margin-bottom: 0.35rem;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      color: #5a2d1a;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid #cf9c84;
      color: #8a3d23;
      background: #fff;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.22rem 0.55rem;
      white-space: nowrap;
    }

    .badge--success {
      border-color: #3e7b2f;
      color: #2f5f24;
      background: #eef8eb;
    }

    .meta {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.35;
      color: #5f4a3f;
    }

    .meta + .meta {
      margin-top: 0.28rem;
    }

    .empty-state {
      margin: 1rem auto 0;
      max-width: 52rem;
      text-align: center;
      color: #6c5445;
    }

    @media (max-width: 768px) {
      .top-row {
        grid-template-columns: 1fr;
        justify-items: center;
      }
      .top-row-left,
      .top-row-right {
        display: none;
      }
    }
  `],
})
export class ArchiveComponent {
  private readonly state = inject(ArchiveOverviewService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly entries = this.state.entries;
  readonly hasEntries = this.state.hasEntries;
  readonly isShowingPrototype = this.state.isShowingPrototype;
  readonly returnTarget = this.route.snapshot.queryParamMap.get('returnTo') === 'edit' ? 'edit' : 'play';

  goHome(): void {
    void this.router.navigate(['/']);
  }

  goToCurrentQuarter(): void {
    void this.router.navigate([this.returnTarget === 'edit' ? '/edit' : '/play']);
  }

  completedPreview(entry: ArchiveEntry): string {
    return entry.completedChallengeNames.slice(0, 3).join(', ');
  }
}
