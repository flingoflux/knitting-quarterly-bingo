import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './storage.service';

// Hilfsobjekt für Tests
const testObj = { foo: 'bar', num: 42 };

// Mock für localStorage
let store: Record<string, string>;
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { store = {}; }
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', localStorageMock);
    service = new StorageService();
  });

  it('should store and load an object when key exists', () => {
    // given
    // when
    service.setItem('test', testObj);
    const result = service.getItem<typeof testObj>('test');
    // then
    expect(result).toEqual(testObj);
  });

  it('should return null when key does not exist', () => {
    // given
    // when + then
    expect(service.getItem('notfound')).toBeNull();
  });

  it('should return null when stored json is invalid', () => {
    // given
    // when
    localStorage.setItem('broken', 'not-json');
    // then
    expect(service.getItem('broken')).toBeNull();
  });

  it('should overwrite existing value when same key is used again', () => {
    // given
    // when
    service.setItem('dup', { a: 1 });
    service.setItem('dup', { a: 2 });
    // then
    expect(service.getItem<{ a: number }>('dup')).toEqual({ a: 2 });
  });

  it('should store and load different value types when serialized', () => {
    // given
    // when
    service.setItem('num', 123);
    // then
    expect(service.getItem<number>('num')).toBe(123);
    service.setItem('arr', [1, 2, 3]);
    expect(service.getItem<number[]>('arr')).toEqual([1, 2, 3]);
  });
});
