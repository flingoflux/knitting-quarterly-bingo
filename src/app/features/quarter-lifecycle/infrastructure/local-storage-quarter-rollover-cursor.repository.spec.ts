import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { LocalStorageQuarterRolloverCursorRepository } from './local-storage-quarter-rollover-cursor.repository';

let store: Record<string, string>;
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; },
};

describe('LocalStorageQuarterRolloverCursorRepository', () => {
  let storage: StorageService;
  let repository: LocalStorageQuarterRolloverCursorRepository;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', localStorageMock);
    storage = new StorageService();
    repository = new LocalStorageQuarterRolloverCursorRepository(storage);
  });

  it('liefert null ohne gespeicherten state', () => {
    expect(repository.load()).toBeNull();
  });

  it('speichert und laedt state', () => {
    repository.save({ activeQuarterId: '2026-Q2' });

    expect(repository.load()).toEqual({ activeQuarterId: '2026-Q2' });
  });

  it('ignoriert invalide Daten', () => {
    storage.setItem('kq-bingo-quarter-lifecycle-v1', { activeQuarterId: 5 });

    expect(repository.load()).toBeNull();
  });
});
