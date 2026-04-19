import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BingoStartComponent } from './start.component';
import { BingoService } from './bingo';

@Component({
  selector: 'app-bingo-start-page',
  standalone: true,
  imports: [BingoStartComponent],
  template: `<app-bingo-start (openBoard)="openBoard()" (newBoard)="newBoard()"></app-bingo-start>`
})
export class BingoStartPageComponent {
  constructor(private router: Router, private bingoService: BingoService) {}

  openBoard() {
    this.router.navigate(['/board']);
  }

  newBoard() {
    this.bingoService.saveEditable(this.bingoService.shuffleBoard());
    this.router.navigate(['/board']);
  }
}
