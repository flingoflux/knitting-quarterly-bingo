import { Component, inject } from '@angular/core';
import { PlayableBingoStateService } from './state/playable-bingo-state.service';
import { PlayableBoardComponent } from './components/playable-board.component';

@Component({
  selector: 'app-play-board-feature',
  standalone: true,
  imports: [PlayableBoardComponent],
  template: `
    <app-playable-board [board]="board"></app-playable-board>
  `,
})
export class PlayBoardFeatureComponent {
  state = inject(PlayableBingoStateService);
  get board() {
    return this.state.getBoard();
  }
}
