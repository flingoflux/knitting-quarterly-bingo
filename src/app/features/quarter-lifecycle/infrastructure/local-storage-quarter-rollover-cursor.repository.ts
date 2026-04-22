import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { QuarterRolloverCursor, isQuarterRolloverCursor } from '../domain/quarter-lifecycle-state';
import { QuarterRolloverCursorRepository } from '../domain/quarter-lifecycle-state.repository';

@Injectable({ providedIn: 'root' })
export class LocalStorageQuarterRolloverCursorRepository implements QuarterRolloverCursorRepository {
  private readonly storageKeyV1 = 'kq-bingo-quarter-lifecycle-v1';

  constructor(private readonly storage: StorageService) {}

  load(): QuarterRolloverCursor | null {
    const raw = this.storage.getItem<unknown>(this.storageKeyV1);
    if (!isQuarterRolloverCursor(raw)) {
      return null;
    }
    return raw;
  }

  save(cursor: QuarterRolloverCursor): void {
    this.storage.setItem(this.storageKeyV1, cursor);
  }

  clear(): void {
    this.storage.removeItem(this.storageKeyV1);
  }
}
