import { Injectable, inject } from '@angular/core';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { QUARTERLY_PLAN_READER } from '../../features/quarterly-plan/domain/quarterly-plan.repository';
import { IMAGE_REPOSITORY } from '../../shared/ports/image-repository';
import { QuarterClock, QuarterId } from '../domain';
import { CleanupOrphanImagesInPort } from './ports/in/cleanup-orphan-images.in-port';

@Injectable({ providedIn: 'root' })
export class CleanupOrphanImagesUseCase implements CleanupOrphanImagesInPort {
  private readonly quarterClock = new QuarterClock();
  private readonly boardReader = inject(QUARTERLY_PLAN_READER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);
  private readonly imageRepository = inject(IMAGE_REPOSITORY);

  cleanupOrphanImages(): void {
    void this.runCleanup();
  }

  private async runCleanup(): Promise<void> {
    const currentQuarterId = QuarterId.parse(this.quarterClock.getQuarterId(new Date()));
    const nextQuarterId = currentQuarterId.next();

    const referencedIds = new Set<string>();

    for (const quarterId of [currentQuarterId, nextQuarterId]) {
      const plan = this.boardReader.load(quarterId);
      if (plan.ok) {
        for (const challenge of plan.value.challenges) {
          if (challenge.imageId) referencedIds.add(challenge.imageId);
        }
      }

      const game = this.bingoGameRepository.load(quarterId);
      if (game !== null) {
        for (const challenge of game.challenges) {
          if (challenge.planningImageId) referencedIds.add(challenge.planningImageId);
          if (challenge.progressImageId) referencedIds.add(challenge.progressImageId);
        }
      }
    }

    const allStoredIds = await this.imageRepository.listAllImageIds();
    const orphanIds = allStoredIds.filter(id => !referencedIds.has(id));

    orphanIds.forEach(id => this.imageRepository.deleteImage(id).catch(() => {}));
  }
}
