import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BoardCell } from '../../shared/domain/board-cell';

export interface PersistedBoardState {
  projects: BoardCell[];
  done: boolean[];
}

@Injectable({ providedIn: 'root' })
export class BoardRepositoryService {
  private readonly storageKey = 'kq-bingo-board-v1';

  constructor(private readonly storage: StorageService) {}

  load(): PersistedBoardState | null {
    return this.storage.getItem<PersistedBoardState>(this.storageKey);
  }

  save(state: PersistedBoardState): void {
    this.storage.setItem(this.storageKey, state);
  }
}
