import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../../../core/services/storage.service';
import { LocalStorageQuarterLifecycleStateRepository } from './local-storage-quarter-lifecycle-state.repository';

let store: Record<string, string>;
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; },
};

describe('LocalStorageQuarterLifecycleStateRepository', () => {
  let storage: StorageService;
  let repository: LocalStorageQuarterLifecycleStateRepository;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', localStorageMock);
    storage = new StorageService();
    repository = new LocalStorageQuarterLifecycleStateRepository(storage);
  });

  it('liefert null ohne gespeicherten state', () => {
    expect(repository.load()).toBeNull();
  });

  it('speichert und laedt state', () => {
    repository.save({ activeQuarterId: '2026-Q2', lastRolloverAt: '2026-04-01T00:00:00.000Z' });

    expect(repository.load()).toEqual({ activeQuarterId: '2026-Q2', lastRolloverAt: '2026-04-01T00:00:00.000Z' });
  });

  it('ignoriert invalide Daten', () => {
    storage.setItem('kq-bingo-quarter-lifecycle-v1', { activeQuarterId: 5 });

    expect(repository.load()).toBeNull();
  });
});
