import { InjectionToken, Signal } from '@angular/core';
import { ArchiveEntry } from '../../../domain/archive-entry';

export interface ShowArchiveOverviewInPort {
  readonly entries: Signal<ArchiveEntry[]>;
  readonly hasEntries: Signal<boolean>;
  readonly isShowingPrototype: Signal<boolean>;

  reload(): void;
}

export const SHOW_ARCHIVE_OVERVIEW_IN_PORT = new InjectionToken<ShowArchiveOverviewInPort>('ShowArchiveOverviewInPort');
