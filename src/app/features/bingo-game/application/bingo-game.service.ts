import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BOARD_DEFINITION_READER, BOARD_DEFINITION_WRITER } from '../../board-configuration/domain/board-definition.repository';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGame, createBoardSignature } from '../domain/bingo-game';

@Injectable()
export class BingoGameService {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());

  readonly projects: Signal<BoardCell[]> = computed(() => this.gameState().projects as BoardCell[]);
  readonly done: Signal<boolean[]> = computed(() => this.gameState().done as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);

  private readonly boardDefinitionRepository = inject(BOARD_DEFINITION_READER);
  private readonly boardDefinitionWriter = inject(BOARD_DEFINITION_WRITER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  constructor() {
    this.refreshFromDefinition();
  }

  hasPlayableBoard(): boolean {
    this.refreshFromDefinition();
    return !this.gameState().isEmpty;
  }

  updateProjectImageId(index: number, imageId: string | undefined): void {
    const projects = [...this.gameState().projects];
    if (index < 0 || index >= projects.length) return;
    projects[index] = { ...projects[index], imageId };
    this.boardDefinitionWriter.save({ projects });
    this.gameState.set(this.gameState().updateProjects(projects));
  }

  resetProgress(): void {
    this.gameState.set(this.gameState().resetProgress());
    this.persist();
  }

  toggle(index: number): void {
    this.gameState.set(this.gameState().toggle(index));
    this.persist();
  }

  private refreshFromDefinition(): void {
    const result = this.boardDefinitionRepository.load();
    if (!result.ok || result.value.projects.length === 0) {
      this.gameState.set(BingoGame.empty());
      return;
    }

    const projects = result.value.projects;
    const persistedProgress = this.bingoGameRepository.load();

    if (persistedProgress !== null && persistedProgress.boardSignature === createBoardSignature(projects)) {
      this.gameState.set(BingoGame.restore(projects, persistedProgress));
      return;
    }

    const game = BingoGame.fromDefinition(projects);
    this.gameState.set(game);
    this.persist();
  }

  private persist(): void {
    this.bingoGameRepository.save(this.gameState().toProgress());
  }
}
