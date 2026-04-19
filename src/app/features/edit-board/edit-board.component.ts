import { Component, inject } from '@angular/core';
import { EditBoardStateService } from './state/edit-board-state.service';
import { EditableBoardComponent } from './components/editable-board.component';
import { shuffleArray } from '../../shared/utils/array-utils';
import { BoardCell } from '../../shared/domain/board-cell';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-board-feature',
  standalone: true,
  imports: [EditableBoardComponent],
  template: `
    <div class="feature-shell">
      <div class="button-bar">
        <button class="icon-btn" (click)="goHome()" title="Zur Startseite" aria-label="Zur Startseite">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7"/>
            <path d="M9 22V12h6v10"/>
            <path d="M21 22H3"/>
          </svg>
        </button>
        <button class="icon-btn" (click)="shuffle()" title="Felder würfeln" aria-label="Felder würfeln">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
        <button class="icon-btn" (click)="playBoard()" title="Als Bingo spielen" aria-label="Als Bingo spielen">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>

      <div class="edit-board-header">
        <p class="eyebrow">Board Studio</p>
        <h2>Knitting Quarterly Bingo planen</h2>
        <p class="subtitle">Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden.</p>
      </div>

      <app-editable-board
        [projects]="projects"
        [dragTargetIndex]="dragTargetIndex"
        (dragStarted)="onDragStart($event)"
        (dragOverCell)="onDragOver($event)"
        (dragLeftCell)="onDragLeave($event)"
        (droppedOnCell)="onDrop($event)"
        (projectEdited)="onProjectEdited($event)"
      ></app-editable-board>
    </div>
  `,
  styles: [`
    .feature-shell {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.4rem 1.1rem 2rem;
    }
    .button-bar {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1.1rem;
    }
    .icon-btn {
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
    .icon-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .icon-btn:hover {
      transform: translateY(-1px);
      background: #fff0db;
      box-shadow: 0 8px 14px rgba(96, 58, 30, 0.16);
    }
    .edit-board-header {
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
    .edit-board-header .subtitle {
      color: #6c5445;
      font-size: 1.03rem;
      max-width: 44rem;
      margin: 0.55rem auto 0;
    }
    @media (max-width: 640px) {
      .feature-shell {
        padding: 1rem 0.75rem 1.4rem;
      }
      .button-bar {
        justify-content: center;
      }
    }
  `],
})
export class EditBoardFeatureComponent {
  state = inject(EditBoardStateService);
  router = inject(Router);
  dragTargetIndex: number | null = null;
  dragStartIndex: number | null = null;

  get projects(): BoardCell[] {
    return this.state.projects();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  shuffle() {
    const projects = this.projects;
    const shuffled = shuffleArray(projects);
    this.state.setProjects(shuffled as BoardCell[]);
  }

  playBoard() {
    this.router.navigate(['/play']);
  }

  onDragStart(i: number) {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  }

  onDragOver(i: number) {
    if (this.dragStartIndex !== null) {
      this.dragTargetIndex = i;
    }
  }

  onDragLeave(_i: number) {
    this.dragTargetIndex = null;
  }

  onDrop(i: number) {
    if (this.dragStartIndex !== null && this.dragStartIndex !== i) {
      this.state.swapProjects(this.dragStartIndex, i);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  }

  onProjectEdited(event: { index: number; project: BoardCell }) {
    this.state.updateProject(event.index, event.project);
  }
}
