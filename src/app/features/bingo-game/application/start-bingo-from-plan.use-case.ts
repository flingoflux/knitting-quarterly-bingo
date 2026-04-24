import { Injectable, inject } from '@angular/core';
import { QuarterClock, QuarterId } from '../../../core/domain';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from '../../quarterly-plan/application/ports/out/persist-quarterly-plan.out-port';
import { PERSIST_BINGO_PROGRESS_OUT_PORT } from './ports/out/persist-bingo-progress.out-port';
import { StartBingoFromPlanInPort } from './ports/in/start-bingo-from-plan.in-port';

@Injectable()
export class StartBingoFromPlanUseCase implements StartBingoFromPlanInPort {
  private readonly quarterClock = new QuarterClock();
  private readonly planLoader = inject(LOAD_QUARTERLY_PLAN_OUT_PORT);
  private readonly planPersister = inject(PERSIST_QUARTERLY_PLAN_OUT_PORT);
  private readonly bingoProgressPersister = inject(PERSIST_BINGO_PROGRESS_OUT_PORT);

  startBingoFromPlan(sourcePlanQuarterId: string): boolean {
    const sourceQuarterId = QuarterId.from(sourcePlanQuarterId);
    const result = this.planLoader.load(sourceQuarterId);

    if (!result.ok || result.value.challenges.length === 0) {
      return false;
    }

    const currentQuarterId = QuarterId.parse(this.quarterClock.getQuarterId(new Date()));

    this.planPersister.persist(currentQuarterId, {
      quarterId: currentQuarterId.toString(),
      challenges: result.value.challenges,
    });

    this.bingoProgressPersister.clear(currentQuarterId);

    return true;
  }
}
