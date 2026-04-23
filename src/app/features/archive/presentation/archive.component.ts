import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchiveOverviewService } from '../application/archive-overview.service';
import { ArchiveEntry } from '../domain/archive-entry';
import { PageToolbarComponent } from '../../../shared/ui/organisms/page-toolbar/page-toolbar.component';
import { ButtonComponent } from '../../../shared/ui/atoms/button/button.component';
import { IconComponent } from '../../../shared/ui/atoms/icon/icon.component';
import { PageContainerComponent } from '../../../shared/ui/templates/page-container/page-container.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, PageToolbarComponent, IconComponent, ButtonComponent, PageContainerComponent],
  template: `
    <kq-page-container>
      <kq-page-toolbar
        quarterLabel="Archiv"
        [showPreviousButton]="false"
        [showNextButton]="true"
        (homeClicked)="goHome()"
        (nextQuarterClicked)="goToCurrentQuarter()"
      >
        <kq-button toolbar-actions variant="icon" (click)="goToHelp()" title="Wie funktioniert Knitting Quarterly?" ariaLabel="Wie funktioniert Knitting Quarterly?">
          <kq-icon name="question" [size]="24"/>
        </kq-button>
      </kq-page-toolbar>

      <div class="feature-shell">
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
          <div class="status-grid" [attr.aria-label]="'Bingo Status: ' + entry.completedCount + ' von ' + entry.totalCount">
            <div
              *ngFor="let d of entry.completed; let i = index"
              class="status-cell"
              [class.done]="d"
              [class.bingo]="isCellInBingo(i, entry.bingoCells)"
            ></div>
          </div>
          <div class="card-content">
            <h3>{{ entry.quarterId }}</h3>
            <p class="meta">{{ entry.completedCount }}/{{ entry.totalCount }} Challenges geschafft</p>
          </div>
        </article>
      </section>

      <ng-template #emptyState>
        <section class="empty-state">
          <p>Noch keine archivierten Runden vorhanden.</p>
        </section>
      </ng-template>
      </div>
    </kq-page-container>
  `,
  styles: [`
    .feature-shell {
      max-width: none;
      width: 100%;
      margin: 0;
      padding: 1.4rem 1.1rem 2rem;
      color: #412a22;
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
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      align-items: start;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.2;
      color: #5a2d1a;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(4, 14px);
      grid-template-rows: repeat(4, 8px);
      gap: 3px;
      margin-top: 0.15rem;
    }

    .status-cell {
      width: 14px;
      height: 8px;
      border-radius: 2px;
      background: #fff;
      border: 1.5px solid #d0b08a;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .status-cell.done {
      background: #145906;
      border-color: #145906;
    }

    .status-cell.bingo {
      background: #145906;
      border-color: #145906;
    }

    .meta {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.35;
      color: #8a7766;
    }

    .empty-state {
      margin: 1rem auto 0;
      max-width: 52rem;
      text-align: center;
      color: #6c5445;
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

  goToHelp(): void {
    this.router.navigate(['/how-it-works']);
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }

  goToCurrentQuarter(): void {
    void this.router.navigate([this.returnTarget === 'edit' ? '/edit' : '/play']);
  }

  isCellInBingo(index: number, bingoCells: number[]): boolean {
    return bingoCells.includes(index);
  }
}
