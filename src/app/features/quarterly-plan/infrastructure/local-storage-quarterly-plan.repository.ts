import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { Challenge, isValidChallenge } from '../../../shared/domain/challenge';
import { QuarterlyPlanData, QuarterlyPlanReader, QuarterlyPlanWriter } from '../domain/quarterly-plan.repository';
import { LoadQuarterlyPlanOutPort } from '../application/ports/out/load-quarterly-plan.out-port';
import { PersistQuarterlyPlanOutPort } from '../application/ports/out/persist-quarterly-plan.out-port';
import { Result } from '../../../shared/domain/result';
import { QuarterClock, QuarterId } from '../../../core/domain';

export interface PersistedQuarterlyPlan {
  quarterId: string;
  challenges: Challenge[];
}

@Injectable({ providedIn: 'root' })
export class LocalStorageQuarterlyPlanRepository
  implements QuarterlyPlanReader, QuarterlyPlanWriter, LoadQuarterlyPlanOutPort, PersistQuarterlyPlanOutPort {
  private readonly storageKeyPrefixV3 = 'kq-bingo-board-definition-v3:';
  private readonly storageKeyV2 = 'kq-bingo-board-definition-v2';
  private readonly storageKeyV1 = 'kq-bingo-board-definition-v1';

  constructor(private readonly storage: StorageService) {}

  load(quarterId: QuarterId): Result<QuarterlyPlanData, string> {
    const quarterIdString = quarterId.toString();
    const rawV3 = this.storage.getItem<{ quarterId?: unknown; challenges: unknown[] }>(this.getStorageKeyV3(quarterId));
    if (rawV3 !== null) {
      if (
        !Array.isArray(rawV3.challenges) ||
        !rawV3.challenges.every(isValidChallenge)
      ) {
        return Result.err('invalid-data');
      }
      const resolvedQuarterId = typeof rawV3.quarterId === 'string' ? rawV3.quarterId : quarterIdString;
      const plan: PersistedQuarterlyPlan = { quarterId: resolvedQuarterId, challenges: rawV3.challenges };
      if (rawV3.quarterId !== resolvedQuarterId) {
        this.storage.setItem(this.getStorageKeyV3(quarterId), plan);
      }
      return Result.ok(plan);
    }

    // Migrate legacy single-board storage only for the current quarter.
    if (quarterIdString !== new QuarterClock().getQuarterId(new Date())) {
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
      const migrated: PersistedQuarterlyPlan = { quarterId: quarterIdString, challenges: rawV2.challenges };
      this.storage.setItem(this.getStorageKeyV3(quarterId), migrated);
      return Result.ok(migrated);
    }

    const rawV1 = this.storage.getItem<{ projects: unknown[] }>(this.storageKeyV1);
    if (rawV1 !== null && Array.isArray(rawV1.projects)) {
      const migrated = rawV1.projects
        .filter((p): p is { title: string; imageId?: string } =>
          typeof p === 'object' && p !== null && typeof (p as { title?: unknown }).title === 'string')
        .map(p => ({ name: p.title, imageId: p.imageId }));
      const plan: PersistedQuarterlyPlan = { quarterId: quarterIdString, challenges: migrated };
      this.storage.setItem(this.getStorageKeyV3(quarterId), plan);
      return Result.ok(plan);
    }

    return Result.err('not-found');
  }

  findById(id: QuarterId): Result<QuarterlyPlanData, string> {
    const idString = id.toString();
    const result = this.load(id);
    if (!result.ok) return result;
    if (result.value.quarterId !== idString) return Result.err('not-found');
    return result;
  }

  save(quarterId: QuarterId, plan: QuarterlyPlanData): void {
    this.storage.setItem(this.getStorageKeyV3(quarterId), {
      quarterId: quarterId.toString(),
      challenges: [...plan.challenges],
    });
  }

  persist(quarterId: QuarterId, plan: QuarterlyPlanData): void {
    this.save(quarterId, plan);
  }

  private getStorageKeyV3(quarterId: QuarterId): string {
    return `${this.storageKeyPrefixV3}${quarterId.toString()}`;
  }
}
