
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


    .cell.drag-target {
      border: 1px dashed #222 !important;
      outline: none;
      background-color: inherit;
      box-shadow: none;
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

  // Für Drag & Drop
  private dragSourceIndex: number | null = null;
  dragTargetIndex: number | null = null;

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
    this.dragSourceIndex = index;
  }

  dragOver(index: number) {
    this.dragTargetIndex = index;
  }

  dragLeave(index: number) {
    if (this.dragTargetIndex === index) {
      this.dragTargetIndex = null;
    }
  }

  drop(index: number) {
    if (this.dragSourceIndex === null || this.dragSourceIndex === index) {
      this.dragTargetIndex = null;
      return;
    }
    // Projekte tauschen
    [this.projects[this.dragSourceIndex], this.projects[index]] = [this.projects[index], this.projects[this.dragSourceIndex]];
    // Done-Status mit tauschen
    [this.done[this.dragSourceIndex], this.done[index]] = [this.done[index], this.done[this.dragSourceIndex]];
    this.dragSourceIndex = null;
    this.dragTargetIndex = null;
    this.updateBingoLines();
    this.save();
  }
}