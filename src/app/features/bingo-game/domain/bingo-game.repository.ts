import { InjectionToken } from '@angular/core';
import { BingoGameProgress } from './bingo-game';

export interface BingoGameRepository {
  load(quarterId: string): BingoGameProgress | null;
  save(quarterId: string, progress: BingoGameProgress): void;
  clear(quarterId: string): void;
}

export const BINGO_GAME_REPOSITORY = new InjectionToken<BingoGameRepository>('BingoGameRepository');
