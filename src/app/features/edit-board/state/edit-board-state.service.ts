import { Injectable, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardDefinitionRepositoryService } from './board-definition-repository.service';
import { createDefaultBoardDefinition, reorderBoardProjects } from '../domain/board-definition';

@Injectable({ providedIn: 'root' })
export class EditBoardStateService {
  private readonly projectsState = signal<BoardCell[]>([]);
  readonly projects: Signal<BoardCell[]> = computed(() => this.projectsState());

  constructor(private readonly repository: BoardDefinitionRepositoryService) {
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

  private persist(): void {
    this.repository.save({
      projects: this.projectsState(),
    });
  }
}
