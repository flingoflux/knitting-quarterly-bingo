import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BoardCell, isValidBoardCell } from '../../../shared/domain/board-cell';
import { BoardDefinitionData, BoardDefinitionReader, BoardDefinitionWriter } from '../domain/board-definition.repository';
import { Result } from '../../../shared/domain/result';

export interface PersistedBoardDefinition {
  id: string;
  projects: BoardCell[];
}

@Injectable({ providedIn: 'root' })
export class LocalStorageBoardRepository implements BoardDefinitionReader, BoardDefinitionWriter {
  private readonly storageKeyV2 = 'kq-bingo-board-definition-v2';
  private readonly storageKeyV1 = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(): Result<BoardDefinitionData, string> {
    const rawV2 = this.storage.getItem<{ id: unknown; projects: unknown[] }>(this.storageKeyV2);
    if (rawV2 !== null) {
      if (
        typeof rawV2.id !== 'string' ||
        !Array.isArray(rawV2.projects) ||
        !rawV2.projects.every(isValidBoardCell)
      ) {
        return Result.err('invalid-data');
      }
      return Result.ok({ id: rawV2.id, projects: rawV2.projects });
    }

    const rawV1 = this.storage.getItem<{ projects: unknown[] }>(this.storageKeyV1);
    if (rawV1 !== null && Array.isArray(rawV1.projects) && rawV1.projects.every(isValidBoardCell)) {
      const migrated: PersistedBoardDefinition = { id: crypto.randomUUID(), projects: rawV1.projects as BoardCell[] };
      this.storage.setItem(this.storageKeyV2, migrated);
      return Result.ok(migrated);
    }

    return Result.err('not-found');
  }

  findById(id: string): Result<BoardDefinitionData, string> {
    const result = this.load();
    if (!result.ok) return result;
    if (result.value.id !== id) return Result.err('not-found');
    return result;
  }

  save(definition: BoardDefinitionData): void {
    this.storage.setItem(this.storageKeyV2, {
      id: definition.id,
      projects: [...definition.projects],
    });
  }
}
