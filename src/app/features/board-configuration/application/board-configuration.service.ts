import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BOARD_DEFINITION_READER, BOARD_DEFINITION_WRITER } from '../domain/board-definition.repository';
import { BoardDefinition } from '../domain/board-definition';

@Injectable({ providedIn: 'root' })
export class BoardConfigurationService {
  private readonly boardState = signal<BoardDefinition>(BoardDefinition.createDefault());
  readonly projects: Signal<BoardCell[]> = computed(() => this.boardState().projects as BoardCell[]);

  private readonly reader = inject(BOARD_DEFINITION_READER);
  private readonly writer = inject(BOARD_DEFINITION_WRITER);

  constructor() {
    const result = this.reader.load();
    if (result.ok && result.value.projects.length > 0) {
      this.boardState.set(BoardDefinition.fromProjects(result.value.projects));
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
    this.writer.save(this.boardState().toPlain());
  }
}
