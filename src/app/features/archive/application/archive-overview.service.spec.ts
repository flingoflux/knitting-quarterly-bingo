import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { QuarterId } from '../../../core/domain';
import { ArchiveEntry } from '../domain/archive-entry';
import { ARCHIVE_REPOSITORY } from '../domain/archive.repository';
import { ArchiveOverviewService } from './archive-overview.service';
import { DEFAULT_ARCHIVE_ENTRIES } from '../domain/default-archive-entries';

class MockArchiveRepository {
  entries: ArchiveEntry[] = [];

  loadAll(): ArchiveEntry[] {
    return [...this.entries];
  }

  append(_entry: ArchiveEntry): void {
    // not needed in these tests
  }

  clear(): void {
    this.entries = [];
  }
}

function createEntry(quarterId: string, archivedAt: string): ArchiveEntry {
  return {
    quarterId: QuarterId.parse(quarterId),
    startedAt: '2026-01-01T00:00:00.000Z',
    archivedAt,
    completedCount: 3,
    totalCount: 16,
    hasBingo: false,
    completedChallengeNames: ['A'],
    completed: [],
    bingoCells: [],
  };
}

function createService(repository: MockArchiveRepository): ArchiveOverviewService {
  const injector = Injector.create({
    providers: [{ provide: ARCHIVE_REPOSITORY, useValue: repository }],
  });
  return runInInjectionContext(injector, () => new ArchiveOverviewService());
}

describe('ArchiveOverviewService', () => {
  it('laedt Eintraege initial sortiert neu nach alt', () => {
    const repository = new MockArchiveRepository();
    repository.entries = [
      createEntry('2025-Q4', '2026-01-01T00:00:00.000Z'),
      createEntry('2026-Q1', '2026-04-01T00:00:00.000Z'),
    ];

    const service = createService(repository);

    expect(service.entries().map(entry => entry.quarterId.toString())).toEqual(['2026-Q1', '2025-Q4']);
    expect(service.hasEntries()).toBe(true);
  });

  it('meldet leeres Archiv korrekt', () => {
    const repository = new MockArchiveRepository();

    const service = createService(repository);

    expect(service.entries()).toEqual(DEFAULT_ARCHIVE_ENTRIES);
    expect(service.hasEntries()).toBe(true);
    expect(service.isShowingPrototype()).toBe(true);
  });

  it('reload liest den aktuellen Repository-Stand neu ein', () => {
    const repository = new MockArchiveRepository();
    repository.entries = [createEntry('2025-Q4', '2026-01-01T00:00:00.000Z')];
    const service = createService(repository);

    repository.entries = [
      createEntry('2026-Q1', '2026-04-01T00:00:00.000Z'),
      createEntry('2025-Q4', '2026-01-01T00:00:00.000Z'),
    ];
    service.reload();

    expect(service.entries().map(entry => entry.quarterId.toString())).toEqual(['2026-Q1', '2025-Q4']);
    expect(service.isShowingPrototype()).toBe(false);
  });
});
