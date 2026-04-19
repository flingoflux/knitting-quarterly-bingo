import { Injectable } from '@angular/core';
import { Project } from './bingo';

@Injectable({ providedIn: 'root' })
export class BingoDragService {
  private dragSourceIndex: number | null = null;
  private dragTargetIndex: number | null = null;

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

  drop(index: number, projects: Project[], done: boolean[]): { projects: Project[], done: boolean[] } | null {
    if (this.dragSourceIndex === null || this.dragSourceIndex === index) {
      this.dragTargetIndex = null;
      return null;
    }
    // Projekte tauschen
    [projects[this.dragSourceIndex], projects[index]] = [projects[index], projects[this.dragSourceIndex]];
    // Done-Status mit tauschen
    [done[this.dragSourceIndex], done[index]] = [done[index], done[this.dragSourceIndex]];
    this.dragSourceIndex = null;
    this.dragTargetIndex = null;
    return { projects, done };
  }

  getDragTargetIndex() {
    return this.dragTargetIndex;
  }

  reset() {
    this.dragSourceIndex = null;
    this.dragTargetIndex = null;
  }
}
