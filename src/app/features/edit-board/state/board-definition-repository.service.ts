import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardDefinitionReader } from '../../../shared/ports/board-definition-reader';

export interface PersistedBoardDefinition {
  projects: BoardCell[];
}

@Injectable({ providedIn: 'root' })
export class BoardDefinitionRepositoryService implements BoardDefinitionReader {
  private readonly storageKey = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(): PersistedBoardDefinition | null {
    return this.storage.getItem<PersistedBoardDefinition>(this.storageKey);
  }

  save(definition: PersistedBoardDefinition): void {
    this.storage.setItem(this.storageKey, {
      projects: [...definition.projects],
    });
  }
}
