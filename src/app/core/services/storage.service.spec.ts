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

  it('speichert und lädt ein Objekt', () => {
    service.setItem('test', testObj);
    const result = service.getItem<typeof testObj>('test');
    expect(result).toEqual(testObj);
  });

  it('liefert null für nicht vorhandenen Key', () => {
    expect(service.getItem('notfound')).toBeNull();
  });

  it('liefert null bei ungültigem JSON', () => {
    localStorage.setItem('broken', 'not-json');
    expect(service.getItem('broken')).toBeNull();
  });

  it('überschreibt vorhandene Werte', () => {
    service.setItem('dup', { a: 1 });
    service.setItem('dup', { a: 2 });
    expect(service.getItem<{ a: number }>('dup')).toEqual({ a: 2 });
  });

  it('kann verschiedene Typen speichern', () => {
    service.setItem('num', 123);
    expect(service.getItem<number>('num')).toBe(123);
    service.setItem('arr', [1, 2, 3]);
    expect(service.getItem<number[]>('arr')).toEqual([1, 2, 3]);
  });
});
