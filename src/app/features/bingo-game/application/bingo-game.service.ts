import { Injectable, inject, Signal, computed, signal } from '@angular/core';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BOARD_DEFINITION_READER } from '../../board-configuration/domain/board-definition.repository';
import { BINGO_GAME_REPOSITORY } from '../domain/bingo-game.repository';
import { BingoGame, createBoardSignature } from '../domain/bingo-game';

@Injectable()
export class BingoGameService {
  private readonly gameState = signal<BingoGame>(BingoGame.empty());
  private readonly _definitionProjects = signal<BoardCell[]>([]);

  readonly projects: Signal<BoardCell[]> = computed(() => this.gameState().projects as BoardCell[]);
  readonly definitionProjects: Signal<BoardCell[]> = this._definitionProjects.asReadonly();
  readonly effectiveProjects: Signal<BoardCell[]> = computed(() => {
    const game = this.gameState().projects as BoardCell[];
    const def = this._definitionProjects();
    return game.map((p, i) => ({
      title: p.title,
      imageId: p.imageId ?? def[i]?.imageId,
    }));
  });
  readonly done: Signal<boolean[]> = computed(() => this.gameState().done as boolean[]);
  readonly bingoCells: Signal<Set<number>> = computed(() => this.gameState().bingoCells);

  private readonly boardDefinitionRepository = inject(BOARD_DEFINITION_READER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  constructor() {
    this.refreshFromDefinition();
  }

  hasPlayableBoard(): boolean {
    this.refreshFromDefinition();
    return !this.gameState().isEmpty;
  }

  updateCellImage(index: number, imageId: string | undefined): void {
    const updated = this.gameState().updateCellImage(index, imageId);
    this.persist(updated);
    this.gameState.set(updated);
  }

  resetProgress(): void {
    const reset = this.gameState().resetProgress();
    this.persist(reset);
    this.gameState.set(reset);
  }

  toggle(index: number): void {
    const toggled = this.gameState().toggle(index);
    this.persist(toggled);
    this.gameState.set(toggled);
  }

  private refreshFromDefinition(): void {
    const result = this.boardDefinitionRepository.load();
    if (!result.ok || result.value.projects.length === 0) {
      this._definitionProjects.set([]);
      this.gameState.set(BingoGame.empty());
      return;
    }

    const { id: boardDefinitionId, projects } = result.value;
    this._definitionProjects.set([...projects]);
    const persistedProgress = this.bingoGameRepository.load();

    if (
      persistedProgress !== null &&
      persistedProgress.boardDefinitionId === boardDefinitionId &&
      persistedProgress.boardSignature === createBoardSignature(projects)
    ) {
      this.gameState.set(BingoGame.restore(projects, persistedProgress));
      return;
    }

    const game = BingoGame.fromDefinition(boardDefinitionId, projects);
    this.persist(game);
    this.gameState.set(game);
  }

  private persist(game: BingoGame): void {
    this.bingoGameRepository.save(game.toProgress());
  }
}
