import { Injectable, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { LocalStorageBoardRepository } from '../infrastructure/local-storage-board.repository';
import { createDefaultBoardDefinition, reorderBoardProjects } from '../domain/board-definition';

@Injectable({ providedIn: 'root' })
export class BoardConfigurationService {
  private readonly projectsState = signal<BoardCell[]>([]);
  readonly projects: Signal<BoardCell[]> = computed(() => this.projectsState());

  constructor(private readonly repository: LocalStorageBoardRepository) {
    const persisted = this.repository.load();
    if (persisted !== null && persisted.projects.length > 0) {
      this.projectsState.set([...persisted.projects]);
      return;
    }

    this.resetBoard();
  }

  resetBoard(): void {
    const defaults = createDefaultBoardDefinition();
    this.projectsState.set([...defaults.projects]);
    this.persist();
  }

  setProjects(projects: BoardCell[]): void {
    this.projectsState.set([...projects]);
    this.persist();
  }

  swapProjects(startIndex: number, targetIndex: number): void {
    const swapped = reorderBoardProjects(this.projectsState(), startIndex, targetIndex);
    this.projectsState.set(swapped);
    this.persist();
  }

  updateProject(index: number, project: BoardCell): void {
    const current = this.projectsState();
    if (!Number.isInteger(index) || index < 0 || index >= current.length) {
      return;
    }

    const updated = [...current];
    updated[index] = { ...project };
    this.projectsState.set(updated);
    this.persist();
  }

  private persist(): void {
    this.repository.save({
      projects: this.projectsState(),
    });
  }
}
