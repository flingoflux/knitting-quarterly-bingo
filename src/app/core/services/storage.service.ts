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
}
