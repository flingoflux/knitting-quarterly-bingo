import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { ARCHIVE_REPOSITORY } from '../domain/archive.repository';
import { ArchiveEntry, sortArchiveEntriesNewestFirst } from '../domain/archive-entry';
import { DEFAULT_ARCHIVE_ENTRIES } from '../domain/default-archive-entries';

@Injectable()
export class ArchiveOverviewService {
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly archiveState = signal<ArchiveEntry[]>([]);
  private readonly showingPrototypeState = signal(false);

  readonly entries: Signal<ArchiveEntry[]> = computed(() => this.archiveState());
  readonly hasEntries: Signal<boolean> = computed(() => this.archiveState().length > 0);
  readonly isShowingPrototype: Signal<boolean> = computed(() => this.showingPrototypeState());

  constructor() {
    this.reload();
  }

  reload(): void {
    const persistedEntries = this.archiveRepository.loadAll();
    if (persistedEntries.length === 0) {
      this.archiveState.set(sortArchiveEntriesNewestFirst(DEFAULT_ARCHIVE_ENTRIES));
      this.showingPrototypeState.set(true);
      return;
    }

    this.archiveState.set(sortArchiveEntriesNewestFirst(persistedEntries));
    this.showingPrototypeState.set(false);
  }
}
