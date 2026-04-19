import { Injectable, Signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardStoreService } from '../../../core/services/board-store.service';

@Injectable({ providedIn: 'root' })
export class EditBoardStateService {
  readonly projects: Signal<BoardCell[]>;

  constructor(private readonly boardStore: BoardStoreService) {
    this.projects = this.boardStore.projects;
    this.boardStore.initializeDefaultsIfEmpty();
  }

  resetBoard(): void {
    this.boardStore.resetToDefaults();
  }

  setProjects(projects: BoardCell[]): void {
    this.boardStore.setProjects(projects);
  }

  swapProjects(startIndex: number, targetIndex: number): void {
    this.boardStore.swapProjects(startIndex, targetIndex);
  }
}
