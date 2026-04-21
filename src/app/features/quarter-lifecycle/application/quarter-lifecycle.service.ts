import { Injectable, inject } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../archive/domain/archive.repository';
import { createArchiveEntry } from '../../archive/domain/archive-entry';
import { QUARTERLY_PLAN_WRITER } from '../../board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../bingo-game/domain/bingo-game.repository';
import { QuarterClock } from '../domain/quarter-clock';
import { createQuarterLifecycleState } from '../domain/quarter-lifecycle-state';
import { QUARTER_LIFECYCLE_STATE_REPOSITORY } from '../domain/quarter-lifecycle-state.repository';

@Injectable({ providedIn: 'root' })
export class QuarterLifecycleService {
  private readonly quarterClock = new QuarterClock();
  private readonly lifecycleStateRepository = inject(QUARTER_LIFECYCLE_STATE_REPOSITORY);
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly boardWriter = inject(QUARTERLY_PLAN_WRITER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  ensureCurrentQuarter(now: Date = new Date()): void {
    const currentQuarterId = this.quarterClock.getQuarterId(now);
    const nowIso = now.toISOString();
    const state = this.lifecycleStateRepository.load();

    if (state === null) {
      this.lifecycleStateRepository.save(createQuarterLifecycleState(currentQuarterId, nowIso));
      return;
    }

    if (!this.quarterClock.isRolloverDue(state.activeQuarterId, currentQuarterId)) {
      return;
    }

    const activeGame = this.bingoGameRepository.load(state.activeQuarterId);
    if (activeGame !== null && activeGame.challenges.length > 0) {
      this.archiveRepository.append(
        createArchiveEntry({
          quarterId: state.activeQuarterId,
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

    this.bingoGameRepository.clear(state.activeQuarterId);
    this.boardWriter.save(currentQuarterId, {
      id: currentQuarterId,
      challenges: DEFAULT_CHALLENGES.map(challenge => ({ ...challenge })),
    });
    this.lifecycleStateRepository.save(createQuarterLifecycleState(currentQuarterId, nowIso));
  }
}
