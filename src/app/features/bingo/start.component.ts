import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bingo-start',
  standalone: true,
  template: `
    <div class="start-container">
      <h2>Willkommen zum Knitting Quarterly Bingo!</h2>
      <button (click)="openBoard.emit()">Vorhandenes Board öffnen</button>
      <button (click)="newBoard.emit()">Neues Board anlegen</button>
    </div>
  `,
  styles: [`
    .start-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
    }
    button {
      min-width: 200px;
      padding: 1rem;
      font-size: 1.1rem;
      border-radius: 8px;
      border: none;
      background: #256029;
      color: #fff;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #388e3c;
    }
  `]
})
export class BingoStartComponent {
  @Output() openBoard = new EventEmitter<void>();
  @Output() newBoard = new EventEmitter<void>();
}
