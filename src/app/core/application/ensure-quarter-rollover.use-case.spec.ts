import { describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { ArchiveEntry } from '../../features/archive/domain/archive-entry';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER, QuarterlyPlanData } from '../../features/quarterly-plan/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { BingoGameProgress } from '../../features/bingo-game/domain/bingo-game';
import { Result } from '../../shared/domain/result';
import { IMAGE_REPOSITORY } from '../../shared/ports/image-repository';
import { EnsureQuarterRolloverUseCase } from './ensure-quarter-rollover.use-case';
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

class MockArchiveRepository {
  entries: ArchiveEntry[] = [];

  loadAll(): ArchiveEntry[] {
    return [...this.entries];
  }

  append(entry: ArchiveEntry): void {
    this.entries.push(entry);
  }

  clear(): void {
    this.entries = [];
  }
}

class MockBoardWriter {
  savedPlans: QuarterlyPlanData[] = [];

  save(_quarterId: QuarterId, plan: QuarterlyPlanData): void {
    this.savedPlans.push({ quarterId: plan.quarterId, challenges: [...plan.challenges] });
  }
}

class MockBingoGameRepository {
  progress: BingoGameProgress | null = null;
  clearCalls = 0;

  load(_quarterId: QuarterId): BingoGameProgress | null {
    return this.progress;
  }

  save(_quarterId: QuarterId, progress: BingoGameProgress): void {
    this.progress = progress;
  }

  clear(_quarterId: QuarterId): void {
    this.clearCalls += 1;
    this.progress = null;
  }
}

class MockImageRepository {
  deleteImage = vi.fn().mockResolvedValue(undefined);
  listAllImageIds = vi.fn().mockResolvedValue([]);
  getImage = vi.fn().mockResolvedValue(null);
  saveImage = vi.fn().mockResolvedValue(undefined);
}

function createService(deps: {
  boardReader: MockBoardReader;
  archiveRepository: MockArchiveRepository;
  boardWriter: MockBoardWriter;
  bingoGameRepository: MockBingoGameRepository;
  imageRepository?: MockImageRepository;
}): EnsureQuarterRolloverUseCase {
  const imageRepository = deps.imageRepository ?? new MockImageRepository();
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: deps.boardReader },
      { provide: ARCHIVE_REPOSITORY, useValue: deps.archiveRepository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: deps.boardWriter },
      { provide: BINGO_GAME_REPOSITORY, useValue: deps.bingoGameRepository },
      { provide: IMAGE_REPOSITORY, useValue: imageRepository },
    ],
  });

  return runInInjectionContext(injector, () => new EnsureQuarterRolloverUseCase());
}

describe('EnsureQuarterRolloverUseCase', () => {
  it('should not create a new board when current quarter board already exists', () => {
    // given
    const boardReader = new MockBoardReader();
    // when
    boardReader.set('2026-Q2', { quarterId: '2026-Q2', challenges: [] });
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    service.persistQuarterRollover(new Date('2026-05-02T10:00:00.000Z'));

    // then
    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toEqual([]);
    expect(bingoGameRepository.clearCalls).toBe(0);
  });

  it('should create default board when current quarter board is missing', () => {
    // given
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    // when
    service.persistQuarterRollover(new Date('2026-04-21T10:00:00.000Z'));

    // then
    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
    expect(bingoGameRepository.clearCalls).toBe(1);
  });

  it('should archive active game and create default board when rollover happens', () => {
    // given
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    bingoGameRepository.progress = {
      quarterId: '2026-Q1',
      planSignature: 'sig',
      startedAt: '2026-01-05T00:00:00.000Z',
      challenges: [
        { name: 'A', completed: true },
        { name: 'B', completed: true },
        { name: 'C', completed: true },
        { name: 'D', completed: true },
      ],
    };
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    // when
    service.persistQuarterRollover(new Date('2026-04-01T08:00:00.000Z'));

    // then
    expect(archiveRepository.entries).toHaveLength(1);
    expect(archiveRepository.entries[0]?.quarterId.toString()).toBe('2026-Q1');
    expect(archiveRepository.entries[0]?.hasBingo).toBe(true);
    expect(bingoGameRepository.clearCalls).toBe(1);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.quarterId).toBe('2026-Q2');
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('should create default board when rollover happens without active game', () => {
    // given
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    // when
    service.persistQuarterRollover(new Date('2026-07-01T08:00:00.000Z'));

    // then
    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.quarterId).toBe('2026-Q3');
    expect(bingoGameRepository.clearCalls).toBe(1);
  });

  it('should delete planning and progress images from active game during rollover', async () => {
    // given
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    bingoGameRepository.progress = {
      quarterId: '2026-Q1',
      planSignature: 'sig',
      startedAt: '2026-01-05T00:00:00.000Z',
      challenges: [
        { name: 'A', completed: true, planningImageId: 'plan-img-1', progressImageId: 'prog-img-1' },
        { name: 'B', completed: false, planningImageId: 'plan-img-2' },
        { name: 'C', completed: false },
      ],
    };
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository, imageRepository });

    // when
    service.persistQuarterRollover(new Date('2026-04-01T08:00:00.000Z'));
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(3));

    // then
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('plan-img-1');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('prog-img-1');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('plan-img-2');
  });

  it('should delete plan images even when no active game exists during rollover', async () => {
    // given
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q1', {
      quarterId: '2026-Q1',
      challenges: [
        { name: 'A', imageId: 'plan-img-only-1' },
        { name: 'B', imageId: 'plan-img-only-2' },
        { name: 'C' },
      ],
    });
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository, imageRepository });

    // when
    service.persistQuarterRollover(new Date('2026-04-01T08:00:00.000Z'));
    await vi.waitFor(() => expect(imageRepository.deleteImage).toHaveBeenCalledTimes(2));

    // then
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('plan-img-only-1');
    expect(imageRepository.deleteImage).toHaveBeenCalledWith('plan-img-only-2');
  });

  it('should not call deleteImage when no rollover is needed', () => {
    // given
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q2', { quarterId: '2026-Q2', challenges: [] });
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const imageRepository = new MockImageRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository, imageRepository });

    // when
    service.persistQuarterRollover(new Date('2026-05-02T10:00:00.000Z'));

    // then
    expect(imageRepository.deleteImage).not.toHaveBeenCalled();
  });
});

