import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { QuarterId } from '../../../core/domain';
import { ArchiveEntry } from '../domain/archive-entry';
import { LOAD_ARCHIVE_ENTRIES_OUT_PORT } from './ports/out/load-archive-entries.out-port';
import { ShowArchiveOverviewUseCase } from './show-archive-overview.use-case';
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

function createUseCase(repository: MockArchiveRepository): ShowArchiveOverviewUseCase {
  const injector = Injector.create({
    providers: [{ provide: LOAD_ARCHIVE_ENTRIES_OUT_PORT, useValue: repository }],
  });
  return runInInjectionContext(injector, () => new ShowArchiveOverviewUseCase());
}

describe('ShowArchiveOverviewUseCase', () => {
  it('should load archive entries sorted from newest to oldest on initialization', () => {
    // given
    const repository = new MockArchiveRepository();
    repository.entries = [
      createEntry('2025-Q4', '2026-01-01T00:00:00.000Z'),
      createEntry('2026-Q1', '2026-04-01T00:00:00.000Z'),
    ];

    const useCase = createUseCase(repository);

    // when + then
    expect(useCase.entries().map(entry => entry.quarterId.toString())).toEqual(['2026-Q1', '2025-Q4']);
    expect(useCase.hasEntries()).toBe(true);
  });

  it('should expose prototype entries when archive is empty', () => {
    // given
    const repository = new MockArchiveRepository();

    const useCase = createUseCase(repository);

    // when + then
    expect(useCase.entries()).toEqual(DEFAULT_ARCHIVE_ENTRIES);
    expect(useCase.hasEntries()).toBe(true);
    expect(useCase.isShowingPrototype()).toBe(true);
  });

  it('should reload entries when repository state changes', () => {
    // given
    const repository = new MockArchiveRepository();
    repository.entries = [createEntry('2025-Q4', '2026-01-01T00:00:00.000Z')];
    const useCase = createUseCase(repository);

    repository.entries = [
      createEntry('2026-Q1', '2026-04-01T00:00:00.000Z'),
      createEntry('2025-Q4', '2026-01-01T00:00:00.000Z'),
    ];

    // when
    useCase.reload();

    // then
    expect(useCase.entries().map(entry => entry.quarterId.toString())).toEqual(['2026-Q1', '2025-Q4']);
    expect(useCase.isShowingPrototype()).toBe(false);
  });
});
