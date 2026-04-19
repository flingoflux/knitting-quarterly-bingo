import { Injectable, Signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardStoreService } from '../../../core/services/board-store.service';

@Injectable({ providedIn: 'root' })
export class PlayBoardStateService {
  readonly projects: Signal<BoardCell[]>;
  readonly done: Signal<boolean[]>;
  readonly bingoCells: Signal<Set<number>>;

  constructor(private readonly boardStore: BoardStoreService) {
    this.projects = this.boardStore.projects;
    this.done = this.boardStore.done;
    this.bingoCells = this.boardStore.bingoCells;
  }

  hasPlayableBoard(): boolean {
    return this.boardStore.hasProjects();
  }

  toggle(index: number): void {
    this.boardStore.toggle(index);
  }
}
