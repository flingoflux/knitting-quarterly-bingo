import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { ArchiveEntry } from '../../features/archive/domain/archive-entry';
import { QUARTERLY_PLAN_WRITER, QuarterlyPlanData } from '../../features/board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { BingoGameProgress } from '../../features/bingo-game/domain/bingo-game';
import { QUARTER_ROLLOVER_CURSOR_REPOSITORY } from '../../features/quarter-lifecycle/domain/quarter-lifecycle-state.repository';
import { QuarterRolloverCursor } from '../../features/quarter-lifecycle/domain/quarter-lifecycle-state';
import { QuarterRolloverOrchestratorService } from './quarter-rollover-orchestrator.service';

class MockQuarterRolloverCursorRepository {
  state: QuarterRolloverCursor | null = null;

  load(): QuarterRolloverCursor | null {
    return this.state;
  }

  save(cursor: QuarterRolloverCursor): void {
    this.state = cursor;
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

  save(_quarterId: string, plan: QuarterlyPlanData): void {
    this.savedPlans.push({ id: plan.id, challenges: [...plan.challenges] });
  }
}

class MockBingoGameRepository {
  progress: BingoGameProgress | null = null;
  clearCalls = 0;

  load(_quarterId: string): BingoGameProgress | null {
    return this.progress;
  }

  save(_quarterId: string, progress: BingoGameProgress): void {
    this.progress = progress;
  }

  clear(_quarterId: string): void {
    this.clearCalls += 1;
    this.progress = null;
  }
}

function createService(deps: {
  lifecycleStateRepository: MockQuarterRolloverCursorRepository;
  archiveRepository: MockArchiveRepository;
  boardWriter: MockBoardWriter;
  bingoGameRepository: MockBingoGameRepository;
}): QuarterRolloverOrchestratorService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTER_ROLLOVER_CURSOR_REPOSITORY, useValue: deps.lifecycleStateRepository },
      { provide: ARCHIVE_REPOSITORY, useValue: deps.archiveRepository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: deps.boardWriter },
      { provide: BINGO_GAME_REPOSITORY, useValue: deps.bingoGameRepository },
    ],
  });

  return runInInjectionContext(injector, () => new QuarterRolloverOrchestratorService());
}

describe('QuarterRolloverOrchestratorService', () => {
  it('initialisiert beim ersten Start nur den lifecycle state', () => {
    const lifecycleStateRepository = new MockQuarterRolloverCursorRepository();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-04-21T10:00:00.000Z'));

    expect(lifecycleStateRepository.state).toEqual({
      activeQuarterId: '2026-Q2',
    });
    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toEqual([]);
    expect(bingoGameRepository.clearCalls).toBe(0);
  });

  it('tut nichts im gleichen Quartal', () => {
    const lifecycleStateRepository = new MockQuarterRolloverCursorRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q2',
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
    const lifecycleStateRepository = new MockQuarterRolloverCursorRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q1',
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
    expect(boardWriter.savedPlans[0]?.id).toBe('2026-Q2');
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
    expect(lifecycleStateRepository.state?.activeQuarterId).toBe('2026-Q2');
  });

  it('legt auch ohne aktives spiel ein neues default-board an', () => {
    const lifecycleStateRepository = new MockQuarterRolloverCursorRepository();
    lifecycleStateRepository.state = {
      activeQuarterId: '2026-Q2',
    };
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ lifecycleStateRepository, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-07-01T08:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.id).toBe('2026-Q3');
    expect(bingoGameRepository.clearCalls).toBe(1);
    expect(lifecycleStateRepository.state?.activeQuarterId).toBe('2026-Q3');
  });
});
