import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Challenge } from '../../../shared/domain/challenge';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from '../domain/quarterly-plan.repository';
import { QuarterlyPlan } from '../domain/quarterly-plan';

@Injectable()
export class BoardConfigurationService {
  private readonly boardState = signal<QuarterlyPlan>(QuarterlyPlan.createDefault());
  private readonly previewMode = signal(false);
  readonly challenges: Signal<Challenge[]> = computed(() => this.boardState().challenges as Challenge[]);
  readonly isPreviewMode = computed(() => this.previewMode());

  private readonly reader = inject(QUARTERLY_PLAN_READER);
  private readonly writer = inject(QUARTERLY_PLAN_WRITER);

  constructor() {
    const result = this.reader.load();
    if (result.ok && result.value.challenges.length > 0) {
      this.boardState.set(QuarterlyPlan.fromChallenges(result.value.challenges, result.value.id));
      return;
    }

    this.resetBoard();
  }

  setPreviewMode(enabled: boolean, quarterId?: string): void {
    this.previewMode.set(enabled);
    if (enabled) {
      const id = quarterId || 'preview-quarter';
      this.boardState.set(QuarterlyPlan.createDefault(id));
    }
  }

  resetBoard(): void {
    this.boardState.set(QuarterlyPlan.createDefault());
    this.persist();
  }

  setChallenges(challenges: Challenge[]): void {
    this.boardState.set(QuarterlyPlan.fromChallenges(challenges, this.boardState().id));
    this.persist();
  }

  swapChallenges(startIndex: number, targetIndex: number): void {
    this.boardState.set(this.boardState().reorder(startIndex, targetIndex));
    this.persist();
  }

  updateChallenge(index: number, challenge: Challenge): void {
    this.boardState.set(this.boardState().update(index, challenge));
    this.persist();
  }

  private persist(): void {
    if (this.previewMode()) {
      return; // Keine Persistierung im Vorschau-Modus
    }
    this.writer.save(this.boardState().toPersistable());
  }
}
