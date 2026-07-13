import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAN_QUARTERLY_IN_PORT } from '../../application/ports/in/plan-quarterly.in-port';
import { EditableBoardDesktopComponent } from './editable-board-desktop.component';
import { Challenge } from '../../../../shared/domain/challenge';
import { IconComponent } from '../../../../shared/ui';
import { ButtonComponent } from '../../../../shared/ui';
import { FeatureHeaderComponent } from '../../../../shared/ui';
import { BoardToolbarDesktopComponent } from '../../../../shared/ui';
import { shuffleArray } from '../../../../shared/utils/array-utils';

@Component({
  selector: 'app-quarterly-plan-desktop',
  standalone: true,
  imports: [CommonModule, EditableBoardDesktopComponent, BoardToolbarDesktopComponent, FeatureHeaderComponent, IconComponent, ButtonComponent],
  template: `
    <kq-feature-header
      [eyebrow]="quarterId"
      title="Challenges planen"
      titleTestId="page-quarterly-plan-title"
      subtitle="Hier kannst du dein persönliches Bingo-Board für das nächste Knitting Quarterly gestalten."
    />

    <kq-board-toolbar-desktop
      [showPrintButton]="true"
      (printClicked)="printRequested.emit()"
    >
      <kq-button variant="icon" (click)="shuffle()" title="Felder würfeln" ariaLabel="Felder würfeln">
        <kq-icon name="shuffle" [size]="22"/>
      </kq-button>
      <kq-button data-testid="action-plan-start-bingo" variant="icon" (click)="startBingo()" title="Neues Bingo mit diesem Plan starten" ariaLabel="Neues Bingo mit diesem Plan starten">
        <kq-icon name="play" [size]="20"/>
      </kq-button>
    </kq-board-toolbar-desktop>

    <app-editable-board
      [challenges]="challenges"
      [dragTargetIndex]="dragTargetIndex"
      (dragStarted)="onDragStart($event)"
      (dragOverCell)="onDragOver($event)"
      (dragLeftCell)="onDragLeave($event)"
      (droppedOnCell)="onDrop($event)"
      (challengeEdited)="onChallengeEdited($event)"
    />
  `,
})
export class QuarterlyPlanDesktopComponent {
  private readonly state = inject(PLAN_QUARTERLY_IN_PORT);
  @Input() quarterId: string = '';

  @Output() printRequested = new EventEmitter<void>();
  @Output() bingoStarted = new EventEmitter<void>();

  dragTargetIndex: number | null = null;
  private dragStartIndex: number | null = null;

  get challenges(): Challenge[] { return this.state.challenges(); }

  shuffle(): void {
    const shuffled = shuffleArray(this.challenges);
    this.state.persistChallenges(shuffled as Challenge[]);
  }

  startBingo(): void {
    this.bingoStarted.emit();
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
}
