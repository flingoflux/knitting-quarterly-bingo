import { Injectable, inject } from '@angular/core';
import { ARCHIVE_REPOSITORY } from '../../features/archive/domain/archive.repository';
import { createArchiveEntry } from '../../features/archive/domain/archive-entry';
import { BINGO_GAME_REPOSITORY } from '../../features/bingo-game/domain/bingo-game.repository';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../../features/quarterly-plan/domain/quarterly-plan.repository';
import { DEFAULT_CHALLENGES } from '../../shared/domain/default-challenges';
import { QuarterClock, QuarterId } from '../domain';
import { EnsureQuarterRolloverInPort } from './ports/in/ensure-quarter-rollover.in-port';

@Injectable({ providedIn: 'root' })
export class EnsureQuarterRolloverUseCase implements EnsureQuarterRolloverInPort {
  private readonly quarterClock = new QuarterClock();
  private readonly archiveRepository = inject(ARCHIVE_REPOSITORY);
  private readonly boardReader = inject(QUARTERLY_PLAN_READER);
  private readonly boardWriter = inject(QUARTERLY_PLAN_WRITER);
  private readonly bingoGameRepository = inject(BINGO_GAME_REPOSITORY);

  persistQuarterRollover(now: Date = new Date()): void {
    const currentQuarterId = QuarterId.parse(this.quarterClock.getQuarterId(now));
    const nowIso = now.toISOString();

    if (this.boardReader.load(currentQuarterId).ok) {
      return;
    }

    const previousQuarterId = currentQuarterId.previous();
    const activeGame = this.bingoGameRepository.load(previousQuarterId);

    if (activeGame !== null && activeGame.challenges.length > 0) {
      this.archiveRepository.append(
        createArchiveEntry({
          quarterId: previousQuarterId,
          archivedAt: nowIso,
          game: {
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
      quarterId: currentQuarterId.toString(),
      challenges: DEFAULT_CHALLENGES.map(challenge => ({ ...challenge })),
    });
  }
}
