import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../shared/domain/challenge';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { IconComponent } from '../../../../shared/ui/atoms/icon/icon.component';
import { ChallengeCardComponent } from '../../../../shared/ui/molecules/challenge-card/challenge-card.component';

interface ChallengeEditedEvent {
  index: number;
  challenge: Challenge;
}

interface CardDetailOpenedEvent {
  index: number;
  challenge: Challenge;
}

@Component({
  selector: 'app-editable-board',
  standalone: true,
  imports: [CommonModule, IconComponent, ChallengeCardComponent],
  template: `
    <div class="grid editable" [class.mode-polaroid]="mode === 'polaroid'" [class.mode-horizontal]="mode === 'horizontal'">
      <div
        *ngFor="let p of challenges; let i = index"
        class="cell"
        [class.drag-target]="dragTargetIndex === i"
        [attr.draggable]="editingIndex === i ? 'false' : 'true'"
        (dragstart)="onDragStart(i, $event)"
        (dragover)="$event.preventDefault(); onDragOver(i)"
        (dragleave)="onDragLeave(i)"
        (drop)="onDrop(i)"
      >
        <kq-challenge-card
          [name]="p.name"
          [imageUrl]="getImage(p.imageId)"
          [mode]="mode"
          [editing]="editingIndex === i"
          [showCameraButton]="true"
          (cameraClicked)="openDetail(i, p, $event)"
        >
          <button
            slot="caption-action"
            type="button"
            class="edit-btn"
            title="Projekt bearbeiten"
            aria-label="Projekt bearbeiten"
            (click)="startEditing(i, p, $event)"
          >
            <kq-icon name="edit" [size]="13"/>
          </button>

          <ng-container slot="caption-title">
            <input
              *ngIf="editingIndex === i"
              class="title-input"
              [value]="getDraftName(i, p.name)"
              (input)="onDraftNameInput(i, $event)"
              (keydown.enter)="saveAndExit(i, p)"
            />
            <div *ngIf="editingIndex !== i" class="title">{{p.name}}</div>
          </ng-container>
        </kq-challenge-card>
      </div>
    </div>
  `,
  styles: [`
    /* ── Grid-Container ── */
    .grid.editable {
      display: grid;
      gap: 0.6rem;
      margin: 0.5rem auto 0;
    }

    /* ── Drag-Wrapper (.cell) ── */
    .cell {
      cursor: grab;
    }
    .cell.drag-target {
      outline: 2px dashed #b56a39;
      outline-offset: 3px;
    }

    /* ── Projected Caption-Inhalte ── */
    .edit-btn {
      position: absolute;
      right: 5px;
      top: 5px;
      border: 1px solid #e0c8ac;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      background: #fffaf4;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: transform 0.18s ease, background 0.2s;
    }
    .edit-btn:hover,
    .edit-btn:focus-visible {
      transform: translateY(-1px);
      background: #ffe8cd;
    }
    .edit-btn:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.3);
      outline-offset: 2px;
    }
    .title {
      font-weight: 700;
      color: #4a2d1c;
      line-height: 1.25;
      text-wrap: balance;
    }
    .title-input {
      border: 1px solid #d0ab86;
      border-radius: 7px;
      padding: 0.3rem 0.5rem;
      background: #fffdf9;
      color: #3f2a1d;
      font-weight: 600;
      text-align: center;
    }
    .title-input:focus-visible {
      outline: 2px solid rgba(196, 110, 53, 0.28);
      outline-offset: 1px;
    }

    /* ── Polaroid-Grid ── */
    .grid.editable.mode-polaroid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 52rem;
    }
    .mode-polaroid .title {
      font-size: 0.74rem;
      text-align: center;
      padding: 0 1.5rem;
      margin-top: 0.1rem;
    }
    .mode-polaroid .title-input {
      width: calc(100% - 2rem);
      font-size: 0.82rem;
      margin-top: 0.25rem;
    }

    /* ── Horizontal-Grid ── */
    .grid.editable.mode-horizontal {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-width: 58rem;
      gap: 0.4rem;
    }
    .mode-horizontal .title {
      font-size: 0.7rem;
      text-align: left;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .mode-horizontal .title-input {
      width: calc(100% - 0.5rem);
      font-size: 0.72rem;
      padding: 0.2rem 0.4rem;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .grid.editable.mode-polaroid,
      .grid.editable.mode-horizontal {
        grid-template-columns: repeat(2, minmax(0, 1fr))t(i, target.value);
  }

  saveAndExit(i: number, challenge: Challenge): void {
    this.saveChallenge(i, challenge);
    this.editingIndex = null;
  }

  saveChallenge(i: number, challenge: Challenge): void {
    if (this.editingIndex !== i) {
      return;
    }

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
