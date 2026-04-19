import { Injectable } from '@angular/core';
import { ImageRepository } from '../../shared/ports/image-repository';

const DB_NAME = 'kq-bingo-images';
const STORE_NAME = 'card-images';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class IndexedDbImageRepository implements ImageRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  async getImage(imageId: string): Promise<string | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(imageId);
      req.onsuccess = () => resolve((req.result as string) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveImage(imageId: string, dataUrl: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(dataUrl, imageId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(imageId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
