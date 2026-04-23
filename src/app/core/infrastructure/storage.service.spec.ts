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

  it('should speichert und lädt ein Objekt', () => {
    // given
    // when
    service.setItem('test', testObj);
    const result = service.getItem<typeof testObj>('test');
    // then
    expect(result).toEqual(testObj);
  });

  it('should liefert null für nicht vorhandenen Key', () => {
    // given
    // when + then
    expect(service.getItem('notfound')).toBeNull();
  });

  it('should liefert null bei ungültigem JSON', () => {
    // given
    // when
    localStorage.setItem('broken', 'not-json');
    // then
    expect(service.getItem('broken')).toBeNull();
  });

  it('should überschreibt vorhandene Werte', () => {
    // given
    // when
    service.setItem('dup', { a: 1 });
    service.setItem('dup', { a: 2 });
    // then
    expect(service.getItem<{ a: number }>('dup')).toEqual({ a: 2 });
  });

  it('should kann verschiedene Typen speichern', () => {
    // given
    // when
    service.setItem('num', 123);
    // then
    expect(service.getItem<number>('num')).toBe(123);
    service.setItem('arr', [1, 2, 3]);
    expect(service.getItem<number[]>('arr')).toEqual([1, 2, 3]);
  });
});
