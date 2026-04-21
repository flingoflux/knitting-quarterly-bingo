import { InjectionToken } from '@angular/core';
import { ArchiveEntry } from './archive-entry';

export interface ArchiveRepository {
  loadAll(): ArchiveEntry[];
  append(entry: ArchiveEntry): void;
  clear(): void;
}

export const ARCHIVE_REPOSITORY = new InjectionToken<ArchiveRepository>('ArchiveRepository');
