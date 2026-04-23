import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem<T>(key: string, fallbackFactory?: () => T): T | null {
    const value = localStorage.getItem(key);
    if (value === null) {
      if (fallbackFactory) {
        const fallback = fallbackFactory();
        this.setItem(key, fallback);
        return fallback;
      }
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      if (fallbackFactory) {
        const fallback = fallbackFactory();
        this.setItem(key, fallback);
        return fallback;
      }
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clearAppData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kq-bingo-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}
