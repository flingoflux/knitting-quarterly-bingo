
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BingoService, Project } from './bingo';

@Component({
  selector: 'app-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bingo.html',
  styles: [`
    .grid{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:8px;
    }

    .cell{
      border:1px solid #ccc;
      padding:10px;
      min-height:80px;
      text-align:center;
      cursor:pointer;
    }

    .cell.done{ background:#d4edda }

    .cat{
      font-size:10px;
      margin-top:5px;
    }

    .cat-basics{color:#3B6D11}
    .cat-technik{color:#185FA5}
    .cat-accessoire{color:#854F0B}
    .cat-challenge{color:#993556}

    .banner{
      background:#d4edda;
      padding:8px;
      margin-bottom:10px;
      text-align:center;
    }
  `]
})
export class BingoComponent implements OnInit {
  projects: Project[] = [];
  done: boolean[] = [];
  bingoLines: number[][] = [];


  bingoService = inject(BingoService);

  ngOnInit() {
    const state = this.bingoService.load();
    this.projects = state.projects;
    this.done = state.done;
    this.updateBingoLines();
  }

  toggle(index: number) {
    this.done[index] = !this.done[index];
    this.updateBingoLines();
    this.save();
  }

  reset() {
    this.done.fill(false);
    this.updateBingoLines();
    this.save();
  }

  shuffle() {
    const newState = this.bingoService.shuffleBoard();
    this.projects = newState.projects;
    this.done = newState.done;
    this.updateBingoLines();
    this.save();
  }

  private updateBingoLines() {
    this.bingoLines = this.bingoService.getBingoLines(this.done);
  }

  private save() {
    this.bingoService.save({ projects: this.projects, done: this.done });
  }

  dragStart(index: number) {
    // Optional: Implement drag and drop if needed
  }

  drop(index: number) {
    // Optional: Implement drag and drop if needed
  }
}