import { Injectable, inject } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { createArchiveEntry } from '../../features/archive/domain/archive-entry';
import { QUARTERLY_PLAN_WRITER } from '../../features/board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { KnittingQuarterly, QuarterClock } from '../domain';
import { createQuarterRolloverCursor } from '../../features/quarter-lifecycle/domain/quarter-lifecycle-state';
import { QUARTER_ROLLOVER_CURSOR_REPOSITORY } from '../../features/quarter-lifecycle/domain/quarter-lifecycle-state.repository';

@Injectable({ providedIn: 'root' })
export class QuarterRolloverOrchestratorService {
  private readonly quarterClock = new QuarterClock();
  private readonly rolloverCursorRepository = inject(QUARTER_ROLLOVER_CURSOR_REPOSITORY);
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly boardWriter = inject(QUARTERLY_PLAN_WRITER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  ensureCurrentQuarter(now: Date = new Date()): void {
    const currentQuarterId = this.quarterClock.getQuarterId(now);
    const nowIso = now.toISOString();
    const cursor = this.rolloverCursorRepository.load();

    if (cursor === null) {
      this.rolloverCursorRepository.save(createQuarterRolloverCursor(currentQuarterId));
      return;
    }

    if (!this.quarterClock.isRolloverDue(cursor.activeQuarterId, currentQuarterId)) {
      return;
    }

    const activeGame = this.bingoGameRepository.load(cursor.activeQuarterId);
    const activeQuarterly = KnittingQuarterly.create({
      quarterId: cursor.activeQuarterId,
      boardDefinitionId: cursor.activeQuarterId,
      lifecycleState: activeGame !== null && activeGame.challenges.length > 0 ? 'play' : 'edit',
    });
    const archivedQuarterly = activeQuarterly.archive(currentQuarterId);

    if (activeGame !== null && activeGame.challenges.length > 0) {
      this.archiveRepository.append(
        createArchiveEntry({
          quarterId: archivedQuarterly.quarterId,
          archivedAt: nowIso,
          game: {
            boardDefinitionId: activeGame.boardDefinitionId,
            startedAt: activeGame.startedAt,
            challenges: activeGame.challenges.map(challenge => ({
              name: challenge.name,
              completed: Boolean(challenge.completed),
            })),
          },
        }),
      );
    }

    this.bingoGameRepository.clear(cursor.activeQuarterId);
    this.boardWriter.save(currentQuarterId, {
      id: currentQuarterId,
      challenges: DEFAULT_CHALLENGES.map(challenge => ({ ...challenge })),
    });
    this.rolloverCursorRepository.save(createQuarterRolloverCursor(currentQuarterId));
  }
}
