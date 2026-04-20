import { Injectable, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { LocalStorageBoardRepository } from '../infrastructure/local-storage-board.repository';
import { BoardDefinition } from '../domain/board-definition';

@Injectable({ providedIn: 'root' })
export class BoardConfigurationService {
  private readonly boardState = signal<BoardDefinition>(BoardDefinition.createDefault());
  readonly projects: Signal<BoardCell[]> = computed(() => this.boardState().projects as BoardCell[]);

  constructor(private readonly repository: LocalStorageBoardRepository) {
    const persisted = this.repository.load();
    if (persisted !== null && persisted.projects.length > 0) {
      this.boardState.set(BoardDefinition.fromProjects(persisted.projects));
      return;
    }

    this.resetBoard();
  }

  resetBoard(): void {
    this.boardState.set(BoardDefinition.createDefault());
    this.persist();
  }

  setProjects(projects: BoardCell[]): void {
    this.boardState.set(BoardDefinition.fromProjects(projects));
    this.persist();
  }

  swapProjects(startIndex: number, targetIndex: number): void {
    this.boardState.set(this.boardState().reorder(startIndex, targetIndex));
    this.persist();
  }

  updateProject(index: number, project: BoardCell): void {
    this.boardState.set(this.boardState().update(index, project));
    this.persist();
  }

  private persist(): void {
    this.repository.save(this.boardState().toPlain());
  }
}
