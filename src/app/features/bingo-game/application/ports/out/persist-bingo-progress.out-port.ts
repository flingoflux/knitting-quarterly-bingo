import { InjectionToken } from '@angular/core';
import { QuarterId } from '../../../../../core/domain';
import { BingoGameProgress } from '../../../domain/bingo-game';

export interface PersistBingoProgressOutPort {
  persist(quarterId: QuarterId, progress: BingoGameProgress): void;
  clear(quarterId: QuarterId): void;
}

export const PERSIST_BINGO_PROGRESS_OUT_PORT = new InjectionToken<PersistBingoProgressOutPort>('PersistBingoProgressOutPort');
