import { InjectionToken } from '@angular/core';

export interface CleanupOrphanImagesInPort {
  cleanupOrphanImages(): void;
}

export const CLEANUP_ORPHAN_IMAGES_IN_PORT = new InjectionToken<CleanupOrphanImagesInPort>('CleanupOrphanImagesInPort');
