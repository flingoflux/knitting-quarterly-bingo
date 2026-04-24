import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { LocalStorageUserSettingsRepository } from './local-storage-user-settings.repository';

let store: Record<string, string>;
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; },
};

describe('LocalStorageUserSettingsRepository', () => {
  let storage: StorageService;
  let repository: LocalStorageUserSettingsRepository;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', localStorageMock);
    storage = new StorageService();
    repository = new LocalStorageUserSettingsRepository(storage);
  });

  it('should return polaroid as default mode when no setting exists', () => {
    expect(repository.loadBoardViewMode()).toBe('polaroid');
  });

  it('should persist selected board view mode', () => {
    repository.persistBoardViewMode('horizontal');

    expect(repository.loadBoardViewMode()).toBe('horizontal');
  });

  it('should reset invalid persisted setting to default mode', () => {
    storage.setItem('kq-bingo-user-setting-board-view-mode-v1', 'grid');

    expect(repository.loadBoardViewMode()).toBe('polaroid');
  });
});
