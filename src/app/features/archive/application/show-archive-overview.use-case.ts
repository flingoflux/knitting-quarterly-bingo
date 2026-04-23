import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { ArchiveEntry, sortArchiveEntriesNewestFirst } from '../domain/archive-entry';
import { DEFAULT_ARCHIVE_ENTRIES } from '../domain/default-archive-entries';
import { ShowArchiveOverviewInPort } from './ports/in/show-archive-overview.in-port';
import { LOAD_ARCHIVE_ENTRIES_OUT_PORT } from './ports/out/load-archive-entries.out-port';

@Injectable()
export class ShowArchiveOverviewUseCase implements ShowArchiveOverviewInPort {
  private readonly archiveLoader = inject(LOAD_ARCHIVE_ENTRIES_OUT_PORT);
  private readonly archiveState = signal<ArchiveEntry[]>([]);
  private readonly showingPrototypeState = signal(false);

  readonly entries: Signal<ArchiveEntry[]> = computed(() => this.archiveState());
  readonly hasEntries: Signal<boolean> = computed(() => this.archiveState().length > 0);
  readonly isShowingPrototype: Signal<boolean> = computed(() => this.showingPrototypeState());

  constructor() {
    this.reload();
  }

  reload(): void {
    const persistedEntries = this.archiveLoader.loadAll();
    if (persistedEntries.length === 0) {
      this.archiveState.set(sortArchiveEntriesNewestFirst(DEFAULT_ARCHIVE_ENTRIES));
      this.showingPrototypeState.set(true);
      return;
    }

    this.archiveState.set(sortArchiveEntriesNewestFirst(persistedEntries));
    this.showingPrototypeState.set(false);
  }
}
