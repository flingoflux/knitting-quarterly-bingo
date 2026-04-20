import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BingoGameProgress } from '../domain/bingo-game';
import { BingoGameRepository } from '../domain/bingo-game.repository';

@Injectable({ providedIn: 'root' })
export class LocalStorageBingoGameRepository implements BingoGameRepository {
  private readonly storageKey = 'kq-bingo-active-game-v2';

  constructor(private readonly storage: StorageService) {}

  load(): BingoGameProgress | null {
    return this.storage.getItem<BingoGameProgress>(this.storageKey);
  }

  save(progress: BingoGameProgress): void {
    this.storage.setItem(this.storageKey, {
      boardDefinitionId: progress.boardDefinitionId,
      boardSignature: progress.boardSignature,
      boardSnapshot: [...progress.boardSnapshot],
      cellImages: [...progress.cellImages],
      done: [...progress.done],
      startedAt: progress.startedAt,
    });
  }

  clear(): void {
    this.storage.removeItem(this.storageKey);
  }
}
