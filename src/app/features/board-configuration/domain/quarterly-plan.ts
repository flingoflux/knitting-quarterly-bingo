import { Challenge } from '../../../shared/domain/challenge';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';

export class QuarterlyPlan {
  private constructor(readonly quarterId: string, private readonly _challenges: readonly Challenge[]) {}

  static createDefault(quarterId: string): QuarterlyPlan {
    return new QuarterlyPlan(quarterId, [...DEFAULT_CHALLENGES]);
  }

  static fromChallenges(challenges: readonly Challenge[], quarterId: string): QuarterlyPlan {
    return new QuarterlyPlan(quarterId, [...challenges]);
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
    return { quarterId: this.quarterId, challenges: [...this._challenges] as Challenge[] };
  }

  toPlain(): { quarterId: string; challenges: Challenge[] } {
    return { quarterId: this.quarterId, challenges: [...this._challenges] as Challenge[] };
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}
