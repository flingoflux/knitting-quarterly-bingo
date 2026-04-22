import { describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { ArchiveEntry } from '../../features/archive/domain/archive-entry';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER, QuarterlyPlanData } from '../../features/board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { BingoGameProgress } from '../../features/bingo-game/domain/bingo-game';
import { Result } from '../../shared/domain/result';
import { QuarterRolloverOrchestratorService } from './quarter-rollover-orchestrator.service';

class MockBoardReader {
  private plans: Map<string, QuarterlyPlanData> = new Map();

  set(quarterId: string, plan: QuarterlyPlanData): void {
    this.plans.set(quarterId, plan);
  }

  load(quarterId: string): Result<QuarterlyPlanData, string> {
    const plan = this.plans.get(quarterId);
    return plan ? Result.ok(plan) : Result.err('not-found');
  }

  findById(id: string): Result<QuarterlyPlanData, string> {
    const plan = this.plans.get(id);
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

  save(_quarterId: string, plan: QuarterlyPlanData): void {
    this.savedPlans.push({ quarterId: plan.quarterId, challenges: [...plan.challenges] });
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
  boardReader: MockBoardReader;
  archiveRepository: MockArchiveRepository;
  boardWriter: MockBoardWriter;
  bingoGameRepository: MockBingoGameRepository;
}): QuarterRolloverOrchestratorService {
  const injector = Injector.create({
    providers: [
      { provide: QUARTERLY_PLAN_READER, useValue: deps.boardReader },
      { provide: ARCHIVE_REPOSITORY, useValue: deps.archiveRepository },
      { provide: QUARTERLY_PLAN_WRITER, useValue: deps.boardWriter },
      { provide: BINGO_GAME_REPOSITORY, useValue: deps.bingoGameRepository },
    ],
  });

  return runInInjectionContext(injector, () => new QuarterRolloverOrchestratorService());
}

describe('QuarterRolloverOrchestratorService', () => {
  it('tut nichts wenn Board fuer aktuelles Quartal schon existiert', () => {
    const boardReader = new MockBoardReader();
    boardReader.set('2026-Q2', { quarterId: '2026-Q2', challenges: [] });
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-05-02T10:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toEqual([]);
    expect(bingoGameRepository.clearCalls).toBe(0);
  });

  it('legt Default-Board an wenn kein Board fuer aktuelles Quartal existiert', () => {
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-04-21T10:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
    expect(bingoGameRepository.clearCalls).toBe(1);
  });

  it('archiviert aktives spiel und legt neues default-board an', () => {
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    bingoGameRepository.progress = {
      quarterId: '2026-Q1',
      boardSignature: 'sig',
      startedAt: '2026-01-05T00:00:00.000Z',
      challenges: [
        { name: 'A', completed: true },
        { name: 'B', completed: true },
        { name: 'C', completed: true },
        { name: 'D', completed: true },
      ],
    };
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-04-01T08:00:00.000Z'));

    expect(archiveRepository.entries).toHaveLength(1);
    expect(archiveRepository.entries[0]?.quarterId).toBe('2026-Q1');
    expect(archiveRepository.entries[0]?.hasBingo).toBe(true);
    expect(bingoGameRepository.clearCalls).toBe(1);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.quarterId).toBe('2026-Q2');
    expect(boardWriter.savedPlans[0]?.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('legt auch ohne aktives spiel ein neues default-board an', () => {
    const boardReader = new MockBoardReader();
    const archiveRepository = new MockArchiveRepository();
    const boardWriter = new MockBoardWriter();
    const bingoGameRepository = new MockBingoGameRepository();
    const service = createService({ boardReader, archiveRepository, boardWriter, bingoGameRepository });

    service.ensureCurrentQuarter(new Date('2026-07-01T08:00:00.000Z'));

    expect(archiveRepository.entries).toEqual([]);
    expect(boardWriter.savedPlans).toHaveLength(1);
    expect(boardWriter.savedPlans[0]?.quarterId).toBe('2026-Q3');
    expect(bingoGameRepository.clearCalls).toBe(1);
  });
});

