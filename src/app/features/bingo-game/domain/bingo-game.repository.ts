import { InjectionToken } from '@angular/core';
import { BingoGameProgress } from './bingo-game';

export interface BingoGameRepository {
  load(): BingoGameProgress | null;
  save(progress: BingoGameProgress): void;
}

export const BINGO_GAME_REPOSITORY = new InjectionToken<BingoGameRepository>('BingoGameRepository');
