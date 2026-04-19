import { Injectable } from '@angular/core';
import { BingoService, Project } from './bingo';
import { BingoDragService } from './bingo-drag.service';

@Injectable({ providedIn: 'root' })
export class BingoStateService {
  state = {
    projects: [] as Project[],
    done: [] as boolean[],
    bingoLines: [] as number[][]
  };

  constructor(
    private bingoService: BingoService,
    private bingoDragService: BingoDragService
  ) {
    this.load();
  }

  isCellInBingo(index: number): boolean {
    return this.state.bingoLines.some(line => line.includes(index));
  }

  load() {
    const loaded = this.bingoService.load();
    this.state.projects = loaded.projects;
    this.state.done = loaded.done;
    this.updateBingoLines();
  }

  toggle(index: number) {
    this.state.done[index] = !this.state.done[index];
    this.updateBingoLines();
    this.save();
  }

  reset() {
    this.state.done.fill(false);
    this.updateBingoLines();
    this.save();
  }

  shuffle() {
    const newState = this.bingoService.shuffleBoard();
    this.state.projects = newState.projects;
    this.state.done = newState.done;
    this.updateBingoLines();
    this.save();
  }

  private updateBingoLines() {
    this.state.bingoLines = this.bingoService.getBingoLines(this.state.done);
  }

  private save() {
    this.bingoService.save({ projects: this.state.projects, done: this.state.done });
  }

  dragStart(index: number) {
    this.bingoDragService.dragStart(index);
  }

  dragOver(index: number) {
    this.bingoDragService.dragOver(index);
  }

  dragLeave(index: number) {
    this.bingoDragService.dragLeave(index);
  }

  drop(index: number) {
    const result = this.bingoDragService.drop(index, this.state.projects, this.state.done);
    if (result) {
      this.state.projects = result.projects;
      this.state.done = result.done;
      this.updateBingoLines();
      this.save();
    }
  }

  get dragTargetIndex() {
    return this.bingoDragService.getDragTargetIndex();
  }
}
