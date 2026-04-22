import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { Challenge, isValidChallenge } from '../../../shared/domain/challenge';
import { QuarterlyPlanData, QuarterlyPlanReader, QuarterlyPlanWriter } from '../domain/quarterly-plan.repository';
import { Result } from '../../../shared/domain/result';
import { QuarterClock } from '../../../core/domain';

export interface PersistedQuarterlyPlan {
  quarterId: string;
  challenges: Challenge[];
}

@Injectable({ providedIn: 'root' })
export class LocalStorageQuarterlyPlanRepository implements QuarterlyPlanReader, QuarterlyPlanWriter {
  private readonly storageKeyPrefixV3 = 'kq-bingo-board-definition-v3:';
  private readonly storageKeyV2 = 'kq-bingo-board-definition-v2';
  private readonly storageKeyV1 = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(quarterId: string): Result<QuarterlyPlanData, string> {
    const rawV3 = this.storage.getItem<{ quarterId?: unknown; challenges: unknown[] }>(this.getStorageKeyV3(quarterId));
    if (rawV3 !== null) {
      if (
        !Array.isArray(rawV3.challenges) ||
        !rawV3.challenges.every(isValidChallenge)
      ) {
        return Result.err('invalid-data');
      }
      const resolvedQuarterId = typeof rawV3.quarterId === 'string' ? rawV3.quarterId : quarterId;
      const plan: PersistedQuarterlyPlan = { quarterId: resolvedQuarterId, challenges: rawV3.challenges };
      if (rawV3.quarterId !== resolvedQuarterId) {
        this.storage.setItem(this.getStorageKeyV3(quarterId), plan);
      }
      return Result.ok(plan);
    }

    // Migrate legacy single-board storage only for the current quarter.
    if (quarterId !== new QuarterClock().getQuarterId(new Date())) {
      return Result.err('not-found');
    }

    const rawV2 = this.storage.getItem<{ id?: unknown; challenges: unknown[] }>(this.storageKeyV2);
    if (rawV2 !== null) {
      if (
        !Array.isArray(rawV2.challenges) ||
        !rawV2.challenges.every(isValidChallenge)
      ) {
        return Result.err('invalid-data');
      }
      const migrated: PersistedQuarterlyPlan = { quarterId, challenges: rawV2.challenges };
      this.storage.setItem(this.getStorageKeyV3(quarterId), migrated);
      return Result.ok(migrated);
    }

    const rawV1 = this.storage.getItem<{ projects: unknown[] }>(this.storageKeyV1);
    if (rawV1 !== null && Array.isArray(rawV1.projects)) {
      const migrated = rawV1.projects
        .filter((p): p is { title: string; imageId?: string } =>
          typeof p === 'object' && p !== null && typeof (p as { title?: unknown }).title === 'string')
        .map(p => ({ name: p.title, imageId: p.imageId }));
      const plan: PersistedQuarterlyPlan = { quarterId, challenges: migrated };
      this.storage.setItem(this.getStorageKeyV3(quarterId), plan);
      return Result.ok(plan);
    }

    return Result.err('not-found');
  }

  findById(id: string): Result<QuarterlyPlanData, string> {
    const result = this.load(id);
    if (!result.ok) return result;
    if (result.value.quarterId !== id) return Result.err('not-found');
    return result;
  }

  save(quarterId: string, plan: QuarterlyPlanData): void {
    this.storage.setItem(this.getStorageKeyV3(quarterId), {
      quarterId,
      challenges: [...plan.challenges],
    });
  }

  private getStorageKeyV3(quarterId: string): string {
    return `${this.storageKeyPrefixV3}${quarterId}`;
  }
}
