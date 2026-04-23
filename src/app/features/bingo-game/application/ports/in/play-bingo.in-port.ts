import { InjectionToken, Signal } from '@angular/core';
import { QuarterId } from '../../../../../core/domain';
import { ChallengeProgress } from '../../../domain/bingo-game';

export interface PlayBingoInPort {
  readonly challenges: Signal<ChallengeProgress[]>;
  readonly completed: Signal<boolean[]>;
  readonly bingoCells: Signal<Set<number>>;
  readonly isPreviewMode: Signal<boolean>;

  setPreviewMode(enabled: boolean, quarterId?: QuarterId | string): void;
  isQuarterPlayable(quarterId: QuarterId | string, restartRequested: boolean): boolean;
  persistProgressImage(index: number, imageId: string | undefined): void;
  persistResetProgress(): void;
  persistToggledChallenge(index: number): void;
}

export const PLAY_BINGO_IN_PORT = new InjectionToken<PlayBingoInPort>('PlayBingoInPort');
