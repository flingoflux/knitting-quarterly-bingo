import { InjectionToken } from '@angular/core';

export interface ImageRepository {
  getImage(cardIndex: number): Promise<string | null>;
  saveImage(cardIndex: number, dataUrl: string): Promise<void>;
  deleteImage(cardIndex: number): Promise<void>;
}

export const IMAGE_REPOSITORY = new InjectionToken<ImageRepository>('ImageRepository');
