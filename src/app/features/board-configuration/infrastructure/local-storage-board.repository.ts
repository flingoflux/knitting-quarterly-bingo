import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BoardCell, isValidBoardCell } from '../../../shared/domain/board-cell';
import { BoardDefinitionReader, BoardDefinitionWriter } from '../domain/board-definition.repository';
import { Result } from '../../../shared/domain/result';

export interface PersistedBoardDefinition {
  projects: BoardCell[];
}

@Injectable({ providedIn: 'root' })
export class LocalStorageBoardRepository implements BoardDefinitionReader, BoardDefinitionWriter {
  private readonly storageKey = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(): Result<PersistedBoardDefinition, string> {
    const raw = this.storage.getItem<{ projects: unknown[] }>(this.storageKey);
    if (raw === null) {
      return Result.err('not-found');
    }
    if (!Array.isArray(raw.projects) || !raw.projects.every(isValidBoardCell)) {
      return Result.err('invalid-data');
    }
    return Result.ok({ projects: raw.projects });
  }

  save(definition: PersistedBoardDefinition): void {
    this.storage.setItem(this.storageKey, {
      projects: [...definition.projects],
    });
  }
}
