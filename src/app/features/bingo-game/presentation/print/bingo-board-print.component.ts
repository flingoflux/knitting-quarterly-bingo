import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PLAY_BINGO_IN_PORT } from '../../application/ports/in/play-bingo.in-port';
import { BoardViewMode, isBoardViewMode } from '../../../user-settings/domain/board-view-mode';
import { BoardGridPrintComponent } from '../../../../shared/ui/print/organisms/board-grid-print/board-grid-print.component';
import { ChallengeCardPrintComponent } from './challenge-card-print.component';
import { IMAGE_REPOSITORY, ImageRepository } from '../../../../shared/ports/image-repository';
import { KnittingQuarterly, QuarterClock } from '../../../../core/domain';

@Component({
  selector: 'app-print-bingo-board',
  standalone: true,
  imports: [CommonModule, BoardGridPrintComponent, ChallengeCardPrintComponent],
  template: `
    <main class="print-view" [class.mode-kompakt]="mode() === 'kompakt'" [class.mode-polaroid]="mode() === 'polaroid'">
      <header class="print-header">
        <img class="print-logo" src="assets/logo.svg" alt="Knitting Quarterly Logo" />
        <div class="print-header-text">
          <p class="print-eyebrow">Knitting Quarterly</p>
          <h1>Bingo {{ printQuarterId() }}</h1>
          <p class="print-subtitle">Ausdrucken, abhaken und kreativ bleiben.</p>
        </div>
      </header>

      <kq-print-board-grid [mode]="mode()">
        <kq-print-challenge-card
          *ngFor="let challenge of challenges(); let i = index"
          [name]="challenge.name"
          [imageUrl]="getImage(challenge.progressImageId ?? challenge.planningImageId)"
          [mode]="mode()"
          [done]="completed()[i]"
          [inBingo]="isCellInBingo(i)"
        />
      </kq-print-board-grid>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #fff;
      color: #2c1b11;
      padding: 1.2rem;
    }

    .print-view {
      max-width: 58rem;
      margin: 0 auto;
    }

    .print-view.mode-polaroid {
      max-width: 52rem;
    }

    .print-view.mode-polaroid kq-print-board-grid {
      max-width: 40rem;
    }

    .print-view.mode-polaroid .print-header {
      max-width: 40rem;
      margin-left: auto;
      margin-right: auto;
    }

    .print-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.8rem;
      text-align: left;
      margin-bottom: 1rem;
      break-inside: avoid;
    }

    .print-header-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .print-logo {
      width: min(178px, 42vw);
      height: auto;
      object-fit: contain;
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .print-eyebrow {
      margin: 0;
      color: #8f3b22;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 700;
    }

    h1 {
      margin: 0.35rem 0 0;
      font-size: 1.8rem;
      color: #5a2d1a;
    }

    .print-subtitle {
      margin: 0.4rem 0 0;
      max-width: 36rem;
      color: #6c5445;
      font-size: 0.98rem;
    }

    @media (max-width: 640px) {
      .print-header {
        gap: 0.65rem;
      }

      .print-logo {
        width: min(142px, 48vw);
      }

      h1 {
        font-size: 1.5rem;
      }
    }

    @media print {
      :host {
        padding: 0;
        margin: 0;
        min-height: 0;
      }

      .print-view {
        max-width: none;
        padding-top: 0;
      }

      .print-view.mode-polaroid kq-print-board-grid {
        max-width: none;
      }

      .print-view.mode-polaroid .print-header {
        max-width: none;
        margin-left: 0;
        margin-right: 0;
      }

      .print-header {
        margin-bottom: 0.5rem;
      }
    }
  `],
})
export class BingoBoardPrintComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(PLAY_BINGO_IN_PORT);
  private readonly quarterClock = new QuarterClock();
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly actualCurrentQuarterId = this.quarterClock.getQuarterId(new Date());
  readonly printQuarterId = signal(this.actualCurrentQuarterId);
  readonly mode = signal<BoardViewMode>('polaroid');
  readonly challenges = computed(() => this.state.challenges());
  readonly completed = computed(() => this.state.completed());
  readonly bingoCells = computed(() => this.state.bingoCells());

  private readonly imageCache = new Map<string, string>();
  private orientationStyleElement: HTMLStyleElement | null = null;
  private printRequested = false;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(queryParams => {
        const quarterParam = queryParams.get('quarter') ?? this.actualCurrentQuarterId;
        const modeParam = queryParams.get('mode');
        const resolvedMode = isBoardViewMode(modeParam) ? modeParam : 'polaroid';

        this.printQuarterId.set(quarterParam);
        this.mode.set(resolvedMode);

        const isPreview = KnittingQuarterly.create({ quarterId: quarterParam })
          .isFuturePreview(this.actualCurrentQuarterId);
        this.state.setPreviewMode(isPreview, quarterParam);

        void this.loadAllImages().then(() => this.requestPrint());
      });
  }

  getImage(imageId: string | undefined): string | null {
    if (!imageId) {
      return null;
    }
    return this.imageCache.get(imageId) ?? null;
  }

  isCellInBingo(index: number): boolean {
    return this.bingoCells().has(index);
  }

  @HostListener('window:afterprint')
  onAfterPrint(): void {
    this.removeOrientationStyle();
  }

  private async loadAllImages(): Promise<void> {
    const imageIds = this.challenges()
      .flatMap(challenge => [challenge.progressImageId, challenge.planningImageId])
      .filter((imageId): imageId is string => !!imageId);

    const uniqueIds = [...new Set(imageIds)];
    await Promise.all(uniqueIds.map(async imageId => {
      const url = await this.imageRepo.getImage(imageId);
      if (url) {
        this.imageCache.set(imageId, url);
      } else {
        this.imageCache.delete(imageId);
      }
    }));

    this.cdr.markForCheck();
  }

  private requestPrint(): void {
    if (this.printRequested) {
      return;
    }

    this.printRequested = true;
    this.applyOrientationStyle();

    requestAnimationFrame(() => {
      window.print();
    });
  }

  private applyOrientationStyle(): void {
    this.removeOrientationStyle();

    const orientation = this.mode() === 'kompakt' ? 'landscape' : 'portrait';
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-kq-print-orientation', orientation);
    styleElement.textContent = `@page { size: A4 ${orientation}; margin: 12mm; }`;

    document.head.appendChild(styleElement);
    this.orientationStyleElement = styleElement;
  }

  private removeOrientationStyle(): void {
    if (!this.orientationStyleElement) {
      return;
    }

    this.orientationStyleElement.remove();
    this.orientationStyleElement = null;
  }
}
