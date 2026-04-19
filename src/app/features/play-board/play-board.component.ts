import { Component, inject, OnInit } from '@angular/core';
import { PlayableBingoStateService } from './state/playable-bingo-state.service';
import { PlayableBoardComponent } from './components/playable-board.component';
import { Router } from '@angular/router';
import { PlayableBingoBoard } from './domain/playable-bingo-board';
import { PlayableProject } from './domain/playable-project';
import { BoardTransferState } from '../../shared/navigation/board-transfer-state';

@Component({
  selector: 'app-play-board-feature',
  standalone: true,
  imports: [PlayableBoardComponent],
  template: `
    <button class="home-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7"/>
        <path d="M9 22V12h6v10"/>
        <path d="M21 22H3"/>
      </svg>
    </button>
    <div class="play-board-header">
      <h2>Knitting Quarterly Bingo spielen</h2>
      <p class="subtitle">Klicke auf die Felder, um erledigte Projekte abzuhaken!</p>
    </div>
    <app-playable-board [board]="board" [toggle]="toggle"></app-playable-board>
  `,
  styles: [
    `.home-btn {
      position: absolute;
      top: 1.2rem;
      left: 1.2rem;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      z-index: 10;
      border-radius: 50%;
      transition: background 0.2s;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .home-btn:focus {
      outline: 2px solid #888;
      background: #f0f0f0;
    }
    .home-btn:hover {
      background: #f5f5f5;
    }
    .play-board-header {
      text-align: center;
      margin-bottom: 1.5rem;
      position: relative;
      margin-top: 4.5rem;
    }
    .play-board-header .subtitle { color: #666; font-size: 1.1rem; margin-top: 0.5rem; }
  `]
})
export class PlayBoardFeatureComponent implements OnInit {
  state = inject(PlayableBingoStateService);
  router = inject(Router);

  ngOnInit() {
    const navState = history.state as Partial<BoardTransferState>;
    if (navState?.projects?.length) {
      const projects = navState.projects.map(p => new PlayableProject(p.title, p.cat, p.catKey));
      const done = new Array(projects.length).fill(false);
      this.state.setBoard(new PlayableBingoBoard(projects, done, []));
    }
  }

  get board() {
    return this.state.getBoard();
  }
  toggle = (i: number) => {
    this.state.toggle(i);
  }
  goHome() {
    this.router.navigate(['/']);
  }
}
