import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../shared/domain/challenge';
import { BoardGridDesktopComponent } from '../../../../shared/ui';
import { PlanCardDesktopComponent } from '../../../../shared/ui';

interface ChallengeEditedEvent {
  index: number;
  challenge: Challenge;
}

@Component({
  selector: 'app-editable-board',
  standalone: true,
  imports: [CommonModule, PlanCardDesktopComponent, BoardGridDesktopComponent],
  template: `
    <kq-board-grid-desktop>
      <div
        *ngFor="let p of challenges; let i = index"
        class="cell"
        [class.drag-target]="dragTargetIndex === i"
        draggable="true"
        (dragstart)="onDragStart(i)"
        (dragover)="$event.preventDefault(); onDragOver(i)"
        (dragleave)="onDragLeave(i)"
        (drop)="onDrop(i)"
      >
        <kq-plan-card-desktop
          [value]="getDraftName(i, p.name)"
          (valueChange)="onDraftNameInput(i, $event)"
          (valueCommitted)="saveChallenge(i, p)"
        />
      </div>
    </kq-board-grid-desktop>
  `,
  styles: [`
    .cell {
      cursor: grab;
      aspect-ratio: 1 / 1;
    }

    .cell.drag-target {
      outline: 2px dashed #b56a39;
      outline-offset: 3px;
    }
  `]
})
export class EditableBoardDesktopComponent {
  @Input() challenges: Challenge[] = [];

  @Input() dragTargetIndex!: number | null;
  @Output() dragStarted = new EventEmitter<number>();
  @Output() dragOverCell = new EventEmitter<number>();
  @Output() dragLeftCell = new EventEmitter<number>();
  @Output() droppedOnCell = new EventEmitter<number>();
  @Output() challengeEdited = new EventEmitter<ChallengeEditedEvent>();

  private readonly draftNames = new Map<number, string>();

  onDragStart(i: number) {
    this.dragStarted.emit(i);
  }

  onDragOver(i: number) {
    this.dragOverCell.emit(i);
  }

  onDragLeave(i: number) {
    this.dragLeftCell.emit(i);
  }

  onDrop(i: number) {
    this.droppedOnCell.emit(i);
  }

  onDraftNameInput(i: number, value: string): void {
    this.draftNames.set(i, value);
  }

  saveChallenge(i: number, challenge: Challenge): void {
    const draftName = this.getDraftName(i, challenge.name).trim();
    const name = draftName.length > 0 ? draftName : challenge.name;
    const updatedChallenge: Challenge = { name, imageId: challenge.imageId };

    if (!this.isSameChallenge(challenge, updatedChallenge)) {
      this.challengeEdited.emit({ index: i, challenge: updatedChallenge });
    }

    this.draftNames.set(i, name);
  }

  getDraftName(i: number, fallback: string): string {
    return this.draftNames.get(i) ?? fallback;
  }

  private isSameChallenge(first: Challenge, second: Challenge): boolean {
    return first.name === second.name;
  }
}