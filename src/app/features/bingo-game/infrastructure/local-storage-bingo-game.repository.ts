import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/infrastructure/storage.service';
import { BingoGameProgress, ChallengeProgress } from '../domain/bingo-game';
import { BingoGameRepository } from '../domain/bingo-game.repository';
import { QuarterClock } from '../../../core/domain';

interface LegacyV2Progress {
  boardDefinitionId: string;
  boardSignature: string;
  challenges: { name: string }[];
  cellImages: (string | undefined)[];
  completed: boolean[];
  startedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageBingoGameRepository implements BingoGameRepository {
  private readonly storageKeyPrefixV4 = 'kq-bingo-active-game-v4:';
  private readonly storageKeyV3 = 'kq-bingo-active-game-v3';
  private readonly storageKeyV2 = 'kq-bingo-active-game-v2';

  constructor(private readonly storage: StorageService) {}

  load(quarterId: string): BingoGameProgress | null {
    const v4 = this.storage.getItem<BingoGameProgress>(this.getStorageKeyV4(quarterId));
    if (v4 !== null) return v4;

    // Migrate legacy single-game storage only for the current quarter.
    if (quarterId !== new QuarterClock().getQuarterId(new Date())) {
      return null;
    }

    const v3 = this.storage.getItem<BingoGameProgress>(this.storageKeyV3);
    if (v3 !== null) return v3;

    const v2 = this.storage.getItem<LegacyV2Progress>(this.storageKeyV2);
    if (
      v2 !== null &&
      Array.isArray(v2.challenges) &&
      Array.isArray(v2.cellImages) &&
      Array.isArray(v2.completed)
    ) {
      const migrated: BingoGameProgress = {
        boardDefinitionId: v2.boardDefinitionId,
        boardSignature: v2.boardSignature,
        challenges: v2.challenges.map((c, i): ChallengeProgress => ({
          name: c.name ?? '',
          planningImageId: undefined,
          progressImageId: v2.cellImages[i],
          completed: Boolean(v2.completed[i]),
        })),
        startedAt: v2.startedAt,
      };
      this.storage.setItem(this.getStorageKeyV4(quarterId), migrated);
      return migrated;
    }

    return null;
  }

  save(quarterId: string, progress: BingoGameProgress): void {
    this.storage.setItem(this.getStorageKeyV4(quarterId), {
      boardDefinitionId: progress.boardDefinitionId,
      boardSignature: progress.boardSignature,
      challenges: [...progress.challenges],
      startedAt: progress.startedAt,
    });
  }

  clear(quarterId: string): void {
    this.storage.removeItem(this.getStorageKeyV4(quarterId));

    // Backward compatibility cleanup for current quarter.
    if (quarterId === new QuarterClock().getQuarterId(new Date())) {
      this.storage.removeItem(this.storageKeyV3);
      this.storage.removeItem(this.storageKeyV2);
    }
  }

  private getStorageKeyV4(quarterId: string): string {
    return `${this.storageKeyPrefixV4}${quarterId}`;
  }
}
