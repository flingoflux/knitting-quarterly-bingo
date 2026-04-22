import { QuarterId } from '../../../core/domain';
import { Challenge } from '../../../shared/domain/challenge';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';

export class QuarterlyPlan {
  private constructor(readonly quarterId: QuarterId, private readonly _challenges: readonly Challenge[]) {}

  static createDefault(quarterId: QuarterId | string): QuarterlyPlan {
    return new QuarterlyPlan(QuarterId.from(quarterId), [...DEFAULT_CHALLENGES]);
  }

  static fromChallenges(challenges: readonly Challenge[], quarterId: QuarterId | string): QuarterlyPlan {
    return new QuarterlyPlan(QuarterId.from(quarterId), [...challenges]);
  }

  get challenges(): readonly Challenge[] {
    return this._challenges;
  }

  reorder(startIndex: number, targetIndex: number): QuarterlyPlan {
    const { length } = this._challenges;
    if (!isValidIndex(startIndex, length) || !isValidIndex(targetIndex, length)) {
      return new QuarterlyPlan(this.quarterId, [...this._challenges]);
    }
    const reordered = [...this._challenges];
    [reordered[startIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[startIndex]];
    return new QuarterlyPlan(this.quarterId, reordered);
  }

  update(index: number, challenge: Challenge): QuarterlyPlan {
    if (!isValidIndex(index, this._challenges.length)) {
      return new QuarterlyPlan(this.quarterId, [...this._challenges]);
    }
    const updated = [...this._challenges];
    updated[index] = { ...challenge };
    return new QuarterlyPlan(this.quarterId, updated);
  }

  toPersistable(): { quarterId: string; challenges: Challenge[] } {
    return { quarterId: this.quarterId.toString(), challenges: [...this._challenges] as Challenge[] };
  }

  toPlain(): { quarterId: string; challenges: Challenge[] } {
    return { quarterId: this.quarterId.toString(), challenges: [...this._challenges] as Challenge[] };
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
