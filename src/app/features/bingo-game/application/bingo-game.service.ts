import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BOARD_DEFINITION_READER } from '../../board-configuration/domain/board-definition.repository';
import { LocalStorageBingoGameRepository } from '../infrastructure/local-storage-bingo-game.repository';
import { LocalStorageBoardRepository } from '../../board-configuration/infrastructure/local-storage-board.repository';
import { computeBingoCells, createBoardSignature, createEmptyDone, normalizeDone, toggleDone } from '../domain/bingo-game';

@Injectable({ providedIn: 'root' })
export class BingoGameService {
  private readonly projectsState = signal<BoardCell[]>([]);
  private readonly doneState = signal<boolean[]>([]);

  readonly projects: Signal<BoardCell[]> = computed(() => this.projectsState());
  readonly done: Signal<boolean[]> = computed(() => this.doneState());
  readonly bingoCells: Signal<Set<number>> = computed(() => computeBingoCells(this.doneState()));

  private readonly boardDefinitionRepository = inject(BOARD_DEFINITION_READER);
  private readonly boardDefinitionWriter = inject(LocalStorageBoardRepository);
  private readonly bingoGameRepository = inject(LocalStorageBingoGameRepository);

  constructor() {
    this.refreshFromDefinition();
  }

  hasPlayableBoard(): boolean {
    this.refreshFromDefinition();
    return this.projectsState().length > 0;
  }

  updateProjectImageId(index: number, imageId: string | undefined): void {
    const projects = [...this.projectsState()];
    if (index < 0 || index >= projects.length) return;
    projects[index] = { ...projects[index], imageId };
    this.projectsState.set(projects);
    this.boardDefinitionWriter.save({ projects });
  }

  resetProgress(): void {
    const empty = createEmptyDone(this.projectsState().length);
    this.doneState.set(empty);
    this.persist();
  }

  toggle(index: number): void {
    const toggled = toggleDone(this.doneState(), index);
    this.doneState.set(toggled);
    this.persist();
  }

  private refreshFromDefinition(): void {
    const boardDefinition = this.boardDefinitionRepository.load();
    if (boardDefinition === null || boardDefinition.projects.length === 0) {
      this.projectsState.set([]);
      this.doneState.set([]);
      return;
    }

    const projects = [...boardDefinition.projects];
    this.projectsState.set(projects);

    const currentSignature = createBoardSignature(projects);
    const persistedProgress = this.bingoGameRepository.load();

    if (persistedProgress !== null && persistedProgress.boardSignature === currentSignature) {
      this.doneState.set(normalizeDone(persistedProgress.done, projects.length));
      return;
    }

    this.doneState.set(createEmptyDone(projects.length));
    this.persist();
  }

  private persist(): void {
    this.bingoGameRepository.save({
      boardSignature: createBoardSignature(this.projectsState()),
      done: this.doneState(),
    });
  }
}
