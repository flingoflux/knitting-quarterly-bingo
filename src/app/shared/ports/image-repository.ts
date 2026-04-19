import { InjectionToken } from '@angular/core';

export interface ImageRepository {
  getImage(imageId: string): Promise<string | null>;
  saveImage(imageId: string, dataUrl: string): Promise<void>;
  deleteImage(imageId: string): Promise<void>;
}

export const IMAGE_REPOSITORY = new InjectionToken<ImageRepository>('ImageRepository');
