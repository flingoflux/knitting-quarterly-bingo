import { InjectionToken } from '@angular/core';
import { BingoGameProgress } from './bingo-game';
import { QuarterId } from '../../../core/domain';

export interface BingoGameRepository {
  load(quarterId: QuarterId): BingoGameProgress | null;
  save(quarterId: QuarterId, progress: BingoGameProgress): void;
  clear(quarterId: QuarterId): void;
}

export const BINGO_GAME_REPOSITORY = new InjectionToken<BingoGameRepository>('BingoGameRepository');
