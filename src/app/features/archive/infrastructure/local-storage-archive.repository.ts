import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { ArchiveEntry, isArchiveEntry } from '../domain/archive-entry';
import { ArchiveRepository } from '../domain/archive.repository';

@Injectable({ providedIn: 'root' })
export class LocalStorageArchiveRepository implements ArchiveRepository {
  private readonly storageKeyV1 = 'kq-bingo-archive-v1';

  constructor(private readonly storage: StorageService) {}

  loadAll(): ArchiveEntry[] {
    const raw = this.storage.getItem<unknown>(this.storageKeyV1);
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter(isArchiveEntry);
  }

  append(entry: ArchiveEntry): void {
    const existing = this.loadAll();
    this.storage.setItem(this.storageKeyV1, [...existing, entry]);
  }

  clear(): void {
    this.storage.removeItem(this.storageKeyV1);
  }
}
