import { Component, inject } from '@angular/core';
import { PlayBoardStateService } from './state/play-board-state.service';
import { PlayableBoardComponent } from './components/playable-board.component';
import { Router } from '@angular/router';
import { BoardCell } from '../../shared/domain/board-cell';

@Component({
  selector: 'app-play-board-feature',
  standalone: true,
  imports: [PlayableBoardComponent],
  template: `
    <div class="feature-shell">
      <div class="toolbar">
        <button class="home-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7"/>
            <path d="M9 22V12h6v10"/>
            <path d="M21 22H3"/>
          </svg>
        </button>
      </div>

      <div class="play-board-header">
        <p class="eyebrow">Bingo Runde</p>
        <h2>Knitting Quarterly Bingo spielen</h2>
        <p class="subtitle">Klicke auf die Felder, um erledigte Projekte abzuhaken und deine Bingo-Linien sichtbar zu machen.</p>
      </div>

      <app-playable-board
        [projects]="projects"
        [done]="done"
        [bingoCells]="bingoCells"
        (toggled)="onToggle($event)"
      ></app-playable-board>
    </div>
  `,
  styles: [
    `.feature-shell {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
    }
    .toolbar {
      display: flex;
      margin-bottom: 1.1rem;
    }
    .home-btn {
      background: #fff7ec;
      color: #7b371f;
      border: 1px solid #c79362;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 999px;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }
    .home-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .home-btn:hover {
      transform: translateY(-1px);
      background: #fff0db;
      box-shadow: 0 8px 14px rgba(96, 58, 30, 0.16);
    }
    .play-board-header {
      text-align: center;
      margin-bottom: 1.1rem;
      padding: 0.6rem 0.4rem;
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
      font-size: clamp(1.6rem, 2.6vw, 2.2rem);
      color: #5a2d1a;
      text-wrap: balance;
    }
    .play-board-header .subtitle {
      color: #6c5445;
      font-size: 1.03rem;
      max-width: 44rem;
      margin: 0.55rem auto 0;
    }
    @media (max-width: 640px) {
      .feature-shell {
        padding: 1rem 0.75rem 1.4rem;
      }
      .toolbar {
        justify-content: center;
      }
    }
  `]
})
export class PlayBoardFeatureComponent {
  state = inject(PlayBoardStateService);
  router = inject(Router);

  get projects(): BoardCell[] {
    return this.state.projects();
  }

  get done(): boolean[] {
    return this.state.done();
  }

  get bingoCells(): Set<number> {
    return this.state.bingoCells();
  }

  onToggle(i: number) {
    this.state.toggle(i);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
