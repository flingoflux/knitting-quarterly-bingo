import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  template: `
    <div class="start-page">
      <h1>Knitting Quarterly Bingo</h1>
      <button (click)="goToEdit()">Neues Board anlegen</button>
      <button (click)="goToPlay()">Letztes Bingo spielen</button>
    </div>
  `,
  styles: [`
    .start-page { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 4rem; }
    button { font-size: 1.2rem; padding: 0.7rem 2rem; }
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
