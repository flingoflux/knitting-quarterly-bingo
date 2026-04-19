import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BingoGameProgress } from '../domain/bingo-game';

@Injectable({ providedIn: 'root' })
export class BingoGameRepositoryService {
  private readonly storageKey = 'kq-bingo-play-state-v1';

  constructor(private readonly storage: StorageService) {}

  load(): BingoGameProgress | null {
    return this.storage.getItem<BingoGameProgress>(this.storageKey);
  }

  save(progress: BingoGameProgress): void {
    this.storage.setItem(this.storageKey, {
      boardSignature: progress.boardSignature,
      done: [...progress.done],
    });
  }
}
