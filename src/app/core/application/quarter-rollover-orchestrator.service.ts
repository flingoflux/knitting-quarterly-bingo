import { Injectable, inject } from '@angular/core';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { createArchiveEntry } from '../../features/archive/domain/archive-entry';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../../features/board-configuration/domain/quarterly-plan.repository';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { QuarterClock, QuarterId } from '../domain';

@Injectable({ providedIn: 'root' })
export class QuarterRolloverOrchestratorService {
  private readonly quarterClock = new QuarterClock();
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly boardReader = inject(QUARTERLY_PLAN_READER);
  private readonly boardWriter = inject(QUARTERLY_PLAN_WRITER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  ensureCurrentQuarter(now: Date = new Date()): void {
    const currentQuarterId = this.quarterClock.getQuarterId(now);
    const nowIso = now.toISOString();

    if (this.boardReader.load(currentQuarterId).ok) {
      return;
    }

    const previousQuarterId = QuarterId.parse(currentQuarterId).previous().toString();
    const activeGame = this.bingoGameRepository.load(previousQuarterId);

    if (activeGame !== null && activeGame.challenges.length > 0) {
      this.archiveRepository.append(
        createArchiveEntry({
          quarterId: previousQuarterId,
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

    this.bingoGameRepository.clear(previousQuarterId);
    this.boardWriter.save(currentQuarterId, {
      id: currentQuarterId,
      challenges: DEFAULT_CHALLENGES.map(challenge => ({ ...challenge })),
    });
  }
}
