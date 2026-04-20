import { Injectable } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { BingoGameProgress, ChallengeProgress } from '../domain/bingo-game';
import { BingoGameRepository } from '../domain/bingo-game.repository';

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
  private readonly storageKeyV3 = 'kq-bingo-active-game-v3';
  private readonly storageKeyV2 = 'kq-bingo-active-game-v2';

  constructor(private readonly storage: StorageService) {}

  load(): BingoGameProgress | null {
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
      this.storage.setItem(this.storageKeyV3, migrated);
      return migrated;
    }

    return null;
  }

  save(progress: BingoGameProgress): void {
    this.storage.setItem(this.storageKeyV3, {
      boardDefinitionId: progress.boardDefinitionId,
      boardSignature: progress.boardSignature,
      challenges: [...progress.challenges],
      startedAt: progress.startedAt,
    });
  }

  clear(): void {
    this.storage.removeItem(this.storageKeyV3);
    this.storage.removeItem(this.storageKeyV2);
  }
}
