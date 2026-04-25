import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAN_QUARTERLY_IN_PORT } from '../../application/ports/in/plan-quarterly.in-port';
import { START_BINGO_FROM_PLAN_IN_PORT } from '../../../bingo-game/application/ports/in/start-bingo-from-plan.in-port';
import { EditableBoardComponent } from '../common/editable-board.component';
import { Challenge } from '../../../../shared/domain/challenge';
import { IconComponent } from '../../../../shared/ui';
import { ButtonComponent } from '../../../../shared/ui';
import { FeatureHeaderComponent } from '../../../../shared/ui';
import { BoardToolbarDesktopComponent } from '../../../../shared/ui';
import { BoardViewMode } from '../../../user-settings/domain/board-view-mode';
import { shuffleArray } from '../../../../shared/utils/array-utils';

interface CardDetailOpenedEvent {
  index: number;
  challenge: Challenge;
}

@Component({
  selector: 'app-quarterly-plan-desktop',
  standalone: true,
  imports: [CommonModule, EditableBoardComponent, BoardToolbarDesktopComponent, FeatureHeaderComponent, IconComponent, ButtonComponent],
  template: `
    <kq-feature-header
      eyebrow="Knitting Quarterly - Board Studio"
      title="Challenges und Projekte planen"
      titleTestId="page-quarterly-plan-title"
      [subtitle]="viewMode === 'polaroid' ? 'Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten, Projekte anordnen und kreativ werden.' : undefined"
      [compact]="viewMode === 'kompakt'"
    />

    <kq-board-toolbar-desktop
      [mode]="viewMode"
      (modeChange)="modeChanged.emit($event)"
    >
      <kq-button variant="icon" (click)="shuffle()" title="Felder würfeln" ariaLabel="Felder würfeln">
        <kq-icon name="shuffle" [size]="22"/>
      </kq-button>
      <kq-button variant="icon" (click)="startBingo()" title="Neues Bingo mit diesem Plan starten" ariaLabel="Neues Bingo mit diesem Plan starten">
        <kq-icon name="play" [size]="20"/>
      </kq-button>
    </kq-board-toolbar-desktop>

    <app-editable-board
      #editableBoard
      [challenges]="challenges"
      [dragTargetIndex]="dragTargetIndex"
      [mode]="viewMode"
      (dragStarted)="onDragStart($event)"
      (dragOverCell)="onDragOver($event)"
      (dragLeftCell)="onDragLeave($event)"
      (droppedOnCell)="onDrop($event)"
      (challengeEdited)="onChallengeEdited($event)"
      (cardDetailOpened)="cardDetailOpened.emit($event)"
    />
  `,
})
export class QuarterlyPlanDesktopComponent {
  private readonly state = inject(PLAN_QUARTERLY_IN_PORT);
  private readonly startBingoFromPlanService = inject(START_BINGO_FROM_PLAN_IN_PORT);

  @ViewChild('editableBoard') private readonly editableBoardRef?: EditableBoardComponent;

  @Input() viewMode: BoardViewMode = 'polaroid';
  @Input() quarterId = '';

  @Output() modeChanged = new EventEmitter<BoardViewMode>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();
  @Output() bingoStarted = new EventEmitter<void>();

  dragTargetIndex: number | null = null;
  private dragStartIndex: number | null = null;

  get challenges(): Challenge[] { return this.state.challenges(); }

  shuffle(): void {
    const shuffled = shuffleArray(this.challenges);
    this.state.persistChallenges(shuffled as Challenge[]);
  }

  startBingo(): void {
    const confirmed = window.confirm(
      `Dein Board startet automatisch mit dem ${this.quarterId} 🧶\n\n` +
      `Möchtest du schon jetzt damit spielen? Das überschreibt das aktuelle Bingo – ` +
      `inklusive deinem Fortschritt und allen Fotos.`,
    );
    if (!confirmed) return;
    const started = this.startBingoFromPlanService.startBingoFromPlan(this.quarterId);
    if (started) {
      this.bingoStarted.emit();
    }
  }

  onDragStart(i: number): void {
    this.dragStartIndex = i;
    this.dragTargetIndex = i;
  }

  onDragOver(i: number): void {
    if (this.dragStartIndex !== null) {
      this.dragTargetIndex = i;
    }
  }

  onDragLeave(_i: number): void {
    this.dragTargetIndex = null;
  }

  onDrop(i: number): void {
    if (this.dragStartIndex !== null && this.dragStartIndex !== i) {
      this.state.persistSwappedChallenges(this.dragStartIndex, i);
    }
    this.dragStartIndex = null;
    this.dragTargetIndex = null;
  }

  onChallengeEdited(event: { index: number; challenge: Challenge }): void {
    this.state.persistUpdatedChallenge(event.index, event.challenge);
  }

  async refreshImage(imageId: string | null): Promise<void> {
    await this.editableBoardRef?.refreshImage(imageId);
  }
}
