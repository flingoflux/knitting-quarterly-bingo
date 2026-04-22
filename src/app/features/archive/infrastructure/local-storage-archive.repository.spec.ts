import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuarterId } from '../../../core/domain';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { LocalStorageArchiveRepository } from './local-storage-archive.repository';

let store: Record<string, string>;
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; }
};

describe('LocalStorageArchiveRepository', () => {
  let storage: StorageService;
  let repository: LocalStorageArchiveRepository;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', localStorageMock);
    storage = new StorageService();
    repository = new LocalStorageArchiveRepository(storage);
  });

  it('liefert leeres Array ohne gespeicherte Daten', () => {
    expect(repository.loadAll()).toEqual([]);
  });

  it('speichert Eintrag via append und laedt ihn wieder', () => {
    repository.append({
      quarterId: QuarterId.parse('2026-Q1'),
      startedAt: '2026-01-01T00:00:00.000Z',
      archivedAt: '2026-04-01T00:00:00.000Z',
      completedCount: 7,
      totalCount: 16,
      hasBingo: true,
      completedChallengeNames: ['A', 'B'],
      completed: [true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      bingoCells: [],
    });

    expect(repository.loadAll()).toHaveLength(1);
    expect(repository.loadAll()[0]?.quarterId.toString()).toBe('2026-Q1');
  });

  it('ignoriert invalide Datensaetze aus dem Storage', () => {
    storage.setItem('kq-bingo-archive-v1', [
      {
        quarterId: '2026-Q1',
        startedAt: '2026-01-01T00:00:00.000Z',
        archivedAt: '2026-04-01T00:00:00.000Z',
        completedCount: 2,
        totalCount: 16,
        hasBingo: false,
        completedChallengeNames: ['A'],
        completed: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        bingoCells: [],
      },
      {
        quarterId: 123,
      },
    ]);

    expect(repository.loadAll()).toHaveLength(1);
    expect(repository.loadAll()[0]?.quarterId.toString()).toBe('2026-Q1');
  });
});
