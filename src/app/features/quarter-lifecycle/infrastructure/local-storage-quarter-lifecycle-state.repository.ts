import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { QuarterLifecycleState, isQuarterLifecycleState } from '../domain/quarter-lifecycle-state';
import { QuarterLifecycleStateRepository } from '../domain/quarter-lifecycle-state.repository';

@Injectable({ providedIn: 'root' })
export class LocalStorageQuarterLifecycleStateRepository implements QuarterLifecycleStateRepository {
  private readonly storageKeyV1 = 'kq-bingo-quarter-lifecycle-v1';

  constructor(private readonly storage: StorageService) {}

  load(): QuarterLifecycleState | null {
    const raw = this.storage.getItem<unknown>(this.storageKeyV1);
    if (!isQuarterLifecycleState(raw)) {
      return null;
    }
    return raw;
  }

  save(state: QuarterLifecycleState): void {
    this.storage.setItem(this.storageKeyV1, state);
  }

  clear(): void {
    this.storage.removeItem(this.storageKeyV1);
  }
}
