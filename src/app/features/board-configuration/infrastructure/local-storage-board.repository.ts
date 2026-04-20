import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { Challenge, isValidChallenge } from '../../../shared/domain/challenge';
import { QuarterlyPlanData, QuarterlyPlanReader, QuarterlyPlanWriter } from '../domain/quarterly-plan.repository';
import { Result } from '../../../shared/domain/result';

export interface PersistedQuarterlyPlan {
  id: string;
  challenges: Challenge[];
}

@Injectable({ providedIn: 'root' })
export class LocalStorageBoardRepository implements QuarterlyPlanReader, QuarterlyPlanWriter {
  private readonly storageKeyV2 = 'kq-bingo-board-definition-v2';
  private readonly storageKeyV1 = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(): Result<QuarterlyPlanData, string> {
    const rawV2 = this.storage.getItem<{ id: unknown; challenges: unknown[] }>(this.storageKeyV2);
    if (rawV2 !== null) {
      if (
        typeof rawV2.id !== 'string' ||
        !Array.isArray(rawV2.challenges) ||
        !rawV2.challenges.every(isValidChallenge)
      ) {
        return Result.err('invalid-data');
      }
      return Result.ok({ id: rawV2.id, challenges: rawV2.challenges });
    }

    const rawV1 = this.storage.getItem<{ projects: unknown[] }>(this.storageKeyV1);
    if (rawV1 !== null && Array.isArray(rawV1.projects)) {
      const migrated = rawV1.projects
        .filter((p): p is { title: string; imageId?: string } =>
          typeof p === 'object' && p !== null && typeof (p as { title?: unknown }).title === 'string')
        .map(p => ({ name: p.title, imageId: p.imageId }));
      const plan: PersistedQuarterlyPlan = { id: crypto.randomUUID(), challenges: migrated };
      this.storage.setItem(this.storageKeyV2, plan);
      return Result.ok(plan);
    }

    return Result.err('not-found');
  }

  findById(id: string): Result<QuarterlyPlanData, string> {
    const result = this.load();
    if (!result.ok) return result;
    if (result.value.id !== id) return Result.err('not-found');
    return result;
  }

  save(plan: QuarterlyPlanData): void {
    this.storage.setItem(this.storageKeyV2, {
      id: plan.id,
      challenges: [...plan.challenges],
    });
  }
}
