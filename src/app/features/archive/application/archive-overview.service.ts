import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { ARCHIVE_REPOSITORY } from '../domain/archive.repository';
import { ArchiveEntry, sortArchiveEntriesNewestFirst } from '../domain/archive-entry';

@Injectable()
export class ArchiveOverviewService {
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly archiveState = signal<ArchiveEntry[]>([]);

  readonly entries: Signal<ArchiveEntry[]> = computed(() => this.archiveState());
  readonly hasEntries: Signal<boolean> = computed(() => this.archiveState().length > 0);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.archiveState.set(sortArchiveEntriesNewestFirst(this.archiveRepository.loadAll()));
  }
}
