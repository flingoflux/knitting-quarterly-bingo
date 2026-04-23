import { InjectionToken } from '@angular/core';
import { ArchiveEntry } from '../../../domain/archive-entry';

export interface LoadArchiveEntriesOutPort {
  loadAll(): ArchiveEntry[];
}

export const LOAD_ARCHIVE_ENTRIES_OUT_PORT = new InjectionToken<LoadArchiveEntriesOutPort>('LoadArchiveEntriesOutPort');
