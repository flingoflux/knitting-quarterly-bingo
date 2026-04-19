import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BoardCell } from '../../../shared/domain/board-cell';
import { BoardDefinitionReader } from '../../../shared/ports/board-definition-reader';

export interface PersistedBoardDefinition {
  projects: BoardCell[];
}

function isValidBoardCell(cell: unknown): cell is BoardCell {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    typeof (cell as BoardCell).title === 'string' &&
    Array.isArray((cell as BoardCell).catKeys) &&
    (cell as BoardCell).catKeys.every((k) => typeof k === 'string') &&
    ((cell as BoardCell).imageId === undefined || typeof (cell as BoardCell).imageId === 'string')
  );
}

@Injectable({ providedIn: 'root' })
export class BoardDefinitionRepositoryService implements BoardDefinitionReader {
  private readonly storageKey = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(): PersistedBoardDefinition | null {
    const raw = this.storage.getItem<{ projects: unknown[] }>(this.storageKey);
    if (raw === null || !Array.isArray(raw.projects) || !raw.projects.every(isValidBoardCell)) {
      return null;
    }
    return { projects: raw.projects };
  }

  save(definition: PersistedBoardDefinition): void {
    this.storage.setItem(this.storageKey, {
      projects: [...definition.projects],
    });
  }
}
