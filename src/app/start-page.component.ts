import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  template: `
    <div class="start-page">
      <img
        class="logo"
        src="assets/logo.svg"
        alt="Logo von Knitting Quarterly Bingo"
        width="340"
        height="340"
      />
      <div class="actions">
        <button class="action-btn action-btn-primary" (click)="goToPlay()">Bingo spielen</button>
        <button class="action-btn action-btn-secondary" (click)="goToEdit()">Board anlegen</button>
      </div>
    </div>
  `,
  styles: [`
    .start-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      margin-top: 3rem;
      padding: 1.5rem;
      color: var(--kq-text);
    }
    .logo {
      width: min(340px, 78vw);
      height: auto;
      display: block;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      max-width: 38rem;
    }
    .action-btn {
      min-width: 16rem;
      border-radius: 999px;
      padding: 0.95rem 1.8rem;
      border: 1px solid var(--kq-outline);
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, color 0.18s ease;
    }
    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--kq-shadow);
    }
    .action-btn:focus-visible {
      outline: 3px solid rgba(196, 110, 53, 0.28);
      outline-offset: 3px;
    }
    .action-btn-primary {
      background: linear-gradient(135deg, var(--kq-primary) 0%, var(--kq-primary-2) 100%);
      color: var(--kq-bg-soft);
      border-color: var(--kq-primary);
    }
    .action-btn-secondary {
      background: var(--kq-bg-soft);
      color: var(--kq-text);
      border-color: var(--kq-outline);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
    }
    @media (max-width: 640px) {
      .start-page {
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .action-btn {
        width: 100%;
        min-width: 0;
      }
    }
  `]
})
export class StartPageComponent {
  constructor(private router: Router) {}

  goToEdit() {
    this.router.navigate(['/edit']);
  }

  goToPlay() {
    this.router.navigate(['/play']);
  }
}
