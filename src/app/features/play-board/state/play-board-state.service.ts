import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BOARD_DEFINITION_READER, BoardDefinitionReader } from '../../../shared/ports/board-definition-reader';
import { BingoGameRepositoryService } from './bingo-game-repository.service';
import { computeBingoCells, createBoardSignature, createEmptyDone, normalizeDone, toggleDone } from '../domain/bingo-game';

@Injectable({ providedIn: 'root' })
export class PlayBoardStateService {
  private readonly projectsState = signal<BoardCell[]>([]);
  private readonly doneState = signal<boolean[]>([]);

  readonly projects: Signal<BoardCell[]> = computed(() => this.projectsState());
  readonly done: Signal<boolean[]> = computed(() => this.doneState());
  readonly bingoCells: Signal<Set<number>> = computed(() => computeBingoCells(this.doneState()));
  readonly hasPlayableBoard: Signal<boolean> = computed(() => this.projectsState().length > 0);

  private readonly boardDefinitionRepository = inject(BOARD_DEFINITION_READER);
  private readonly bingoGameRepository = inject(BingoGameRepositoryService);

  constructor() {
    this.refreshFromDefinition();
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
