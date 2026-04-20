import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from './shared/ui/atoms/button/button.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [ButtonComponent],
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
        <kq-button variant="primary" (click)="goToPlay()">Bingo spielen</kq-button>
        <kq-button variant="secondary" (click)="goToEdit()">Board anlegen</kq-button>
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
    @media (max-width: 640px) {
      .start-page {
        gap: 1.5rem;
        margin-top: 2rem;
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
