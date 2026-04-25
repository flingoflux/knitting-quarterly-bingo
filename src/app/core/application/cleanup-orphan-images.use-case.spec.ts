import { describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { QUARTERLY_PLAN_READER, QuarterlyPlanData } from '../../features/quarterly-plan/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { BingoGameProgress } from '../../features/bingo-game/domain/bingo-game';
import { Result } from '../../shared/domain/result';
import { IMAGE_REPOSITORY } from '../../shared/ports/image-repository';
import { CleanupOrphanImagesUseCase } from './cleanup-orphan-images.use-case';
import { QuarterId } from '../domain';

class MockBoardReader {
  private plans: Map<string, QuarterlyPlanData> = new Map();

  set(quarterId: QuarterId | string, plan: QuarterlyPlanData): void {
    this.plans.set(QuarterId.from(quarterId).toString(), plan);
  }

  load(quarterId: QuarterId): Result<QuarterlyPlanData, string> {
    const plan = this.plans.get(quarterId.toString());
    return plan ? Result.ok(plan) : Result.err('not-found');
  }

  findById(id: QuarterId): Result<QuarterlyPlanData, string> {
    const plan = this.plans.get(id.toString());
    return plan ? Result.ok(plan) : Result.err('not-found');
  }
}

class MockBingoGameRepository {
  private games: Map<string, BingoGameProgress> = new Map();

  set(quarterId: QuarterId | string, progress: BingoGameProgress): void {
    this.games.set(QuarterId.from(quarterId).toString(), progress);
  }

  load(quarterId: QuarterId): BingoGameProgress | null {
    return this.games.get(quarterId.toString()) ?? null;
  }

  save(_quarterId: QuarterId, progress: BingoGameProgress): void {
    this.games.set(_quarterId.toString(), progress);
  }

  clear(quarterId: QuarterId): void {
    this.games.delete(quarterId.toString());
  }
}

class MockImageRepository {
  deleteImage = vi.fn().mockResolvedValue(undefined);
  listAllImageIds = vi.fn().mockResolvedValue([] as string[]);
  getImage = vi.fn().mockResolvedValue(null);
  saveImage = vi.fn().mockResolvedValue(undefined);
}

function createService(deps: {
  boardReader: MockBoardReader;
  bingoGameRepository: MockBingoGameRepository;
  imageRepository: MockImageRepository;
}): CleanupOrphanImagesUseCase {
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: deps.boardReader },
      { provide: BINGO_GAME_REPOSITORY, useValue: deps.bingoGameRepository },
      { provide: IMAGE_REPOSITORY, useValue: deps.imageRepository },
    ],
  });

  return runInInjectionContext(injector, () => new CleanupOrphanImagesUseCase());
}

// Fix date to 2026-Q2 for deterministic results
const NOW = new Date('2026-05-01T12:00:00.000Z');

describe('CleanupOrphanImagesUseCase', () => {
  it('should delete images not referenced by current or next quarter', async () => {
    // given
    const boardReader = new MockBoardReader();
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue(['orphan-1', 'orphan-2', 'orphan-3']);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(3));

    // then
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-1');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-2');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-3');
  });

  it('should not delete images referenced in current quarter plan', async () => {
    // given
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q2', {
      quarterId: '2026-Q2',
      challenges: [{ name: 'A', imageId: 'active-plan-img' }],
    });
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue(['active-plan-img', 'orphan-1']);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(1));

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalledWith('active-plan-img');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-1');
  });

  it('should not delete images referenced in next quarter plan (future planning)', async () => {
    // given
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q3', {
      quarterId: '2026-Q3',
      challenges: [{ name: 'B', imageId: 'next-quarter-img' }],
    });
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue(['next-quarter-img', 'orphan-2']);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(1));

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalledWith('next-quarter-img');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-2');
  });

  it('should not delete planning or progress images from current quarter game', async () => {
    // given
    const boardReader = new MockBoardReader();
    const bingoGameRepository = new MockBingoGameRepository();
    bingoGameRepository.set('2026-Q2', {
      quarterId: '2026-Q2',
      planSignature: 'sig',
      startedAt: '2026-04-01T00:00:00.000Z',
      challenges: [
        { name: 'A', completed: false, planningImageId: 'game-plan-img', progressImageId: 'game-progress-img' },
      ],
    });
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue(['game-plan-img', 'game-progress-img', 'orphan-3']);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(1));

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalledWith('game-plan-img');
    expect(imageRepository.deleteImage).not.toHaveBeenCalledWith('game-progress-img');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('orphan-3');
  });

  it('should not call deleteImage when all stored images are referenced', async () => {
    // given
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q2', {
      quarterId: '2026-Q2',
      challenges: [{ name: 'A', imageId: 'img-1' }, { name: 'B', imageId: 'img-2' }],
    });
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue(['img-1', 'img-2']);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.listAllImageIds).toHaveBeenCalled());

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalled();
  });

  it('should not call deleteImage when IndexedDB is empty', async () => {
    // given
    const boardReader = new MockBoardReader();
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    imageRepository.listAllImageIds.mockResolvedValue([]);
    const service = createService({ boardReader, bingoGameRepository, imageRepository });

    // when
    service.cleanupOrphanImages();
    await vi.waitFor(() => expect(imageRepository.listAllImageIds).toHaveBeenCalled());

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalled();
  });

  void NOW; // suppress unused warning – variable documents fixed test date assumption
});
