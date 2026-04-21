import { describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../archive/domain/archive.repository';
import { ArchiveEntry } from '../../archive/domain/archive-entry';
import { QUARTERLY_PLAN_WRITER, QuarterlyPlanData } from '../../board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../bingo-game/domain/bingo-game.repository';
import { BingoGameProgress } from '../../bingo-game/domain/bingo-game';
import { QuarterLifecycleService } from './quarter-lifecycle.service';
import { QUARTER_LIFECYCLE_STATE_REPOSITORY } from '../domain/quarter-lifecycle-state.repository';
import { QuarterLifecycleState } from '../domain/quarter-lifecycle-state';

class MockQuarterLifecycleStateRepository {
  state: QuarterLifecycleState | null = null;

  load(): QuarterLifecycleState | null {
    return this.state;
  }

  save(state: QuarterLifecycleState): void {
    this.state = state;
  }

  clear(): void {
    this.state = null;
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

  save(plan: QuarterlyPlanData): void {
    this.savedPlans.push({ id: plan.id, challenges: [...plan.challenges] });
  }
}

class MockBingoGameRepository {
  progress: BingoGameProgress | null = null;
  clearCalls = 0;

  load(): BingoGameProgress | null {
    return this.progress;
  }

  save(progress: BingoGameProgress): void {
    this.progress = progress;
  }

  clear(): void {
    this.clearCalls += 1;
    this.progress = null;
  }
}

function createService(deps: {
  lifecycleStateRepository: MockQuarterLifecycleStateRepository;
  archiveRepository: MockArchiveRepository;
  boardWriter: MockBoardWriter;
  bingoGameRepository: MockBingoGameRepository;
}): QuarterLifecycleService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTER_LIFECYCLE_STATE_REPOSITORY, useValue: deps.lifecycleStateRepository },
      { provide: ARCHIVE_REPOSITORY, useValue: deps.archiveRepository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: deps.boardWriter },
      { provide: BINGO_GAME_REPOSITORY, useValue: deps.bingoGameRepository },
    ],
  });

  return runInInjectionContext(injector, () => new QuarterLifecycleService());
}

describe('QuarterLifecycleService', () => {
  it('initialisiert beim ersten Start nur den lifecycle state', () => {
    const lifecycleStateRepository = new MockQuarterLifecycleStateRepository();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-04-21T10:00:00.000Z'));

    expect(lifecycleStateRepository.state).toEqual({
      activeQuarterId: '2026-Q2',
      lastRolloverAt: '2026-04-21T10:00:00.000Z',
    });
    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toEqual([]);
    expect(bingoGameRepository.clearCalls).toBe(0);
  });

  it('tut nichts im gleichen Quartal', () => {
    const lifecycleStateRepository = new MockQuarterLifecycleStateRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q2',
      lastRolloverAt: '2026-04-01T00:00:00.000Z',
    };
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-05-02T10:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toEqual([]);
    expect(bingoGameRepository.clearCalls).toBe(0);
  });

  it('archiviert aktives spiel und legt neues default-board an', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'new-board-id' });
    const lifecycleStateRepository = new MockQuarterLifecycleStateRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q1',
      lastRolloverAt: '2026-01-01T00:00:00.000Z',
    };
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    bingoGameRepository.progress = {
      boardDefinitionId: 'board-q1',
      boardSignature: 'sig',
      startedAt: '2026-01-05T00:00:00.000Z',
      challenges: [
        { name: 'A', completed: true },
        { name: 'B', completed: true },
        { name: 'C', completed: true },
        { name: 'D', completed: true },
      ],
    };
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-04-01T08:00:00.000Z'));

    expect(archiveRepository.entries).toHaveLength(1);
    expect(archiveRepository.entries[0]?.quarterId).toBe('2026-Q1');
    expect(archiveRepository.entries[0]?.boardDefinitionId).toBe('board-q1');
    expect(archiveRepository.entries[0]?.hasBingo).toBe(true);
    expect(bingoGameRepository.clearCalls).toBe(1);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.id).toBe('new-board-id');
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
    expect(lifecycleStateRepository.state?.activeQuarterId).toBe('2026-Q2');
  });

  it('legt auch ohne aktives spiel ein neues default-board an', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'new-board-id-2' });
    const lifecycleStateRepository = new MockQuarterLifecycleStateRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q2',
      lastRolloverAt: '2026-04-01T00:00:00.000Z',
    };
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-07-01T08:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.id).toBe('new-board-id-2');
    expect(bingoGameRepository.clearCalls).toBe(1);
    expect(lifecycleStateRepository.state?.activeQuarterId).toBe('2026-Q3');
  });
});
