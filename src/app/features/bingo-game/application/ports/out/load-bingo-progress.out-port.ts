import { InjectionToken } from '@angular/core';
import { QuarterId } from '../../../../../core/domain';
import { BingoGameProgress } from '../../../domain/bingo-game';

export interface LoadBingoProgressOutPort {
  load(quarterId: QuarterId): BingoGameProgress | null;
}

export const LOAD_BINGO_PROGRESS_OUT_PORT = new InjectionToken<LoadBingoProgressOutPort>('LoadBingoProgressOutPort');
