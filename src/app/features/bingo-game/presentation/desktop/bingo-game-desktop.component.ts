import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAY_BINGO_IN_PORT } from '../../application/ports/in/play-bingo.in-port';
import { PlayableBoardDesktopComponent } from './playable-board-desktop.component';
import { ChallengeProgress } from '../../domain/bingo-game';
import { StatusMiniGridComponent } from '../../../../shared/ui';
import { FeatureHeaderComponent } from '../../../../shared/ui';
import { BoardToolbarDesktopComponent } from '../../../../shared/ui';
import { BoardViewMode } from '../../../user-settings/domain/board-view-mode';

interface CardDetailOpenedEvent {
  index: number;
  challenge: ChallengeProgress;
}

@Component({
  selector: 'app-bingo-game-desktop',
  standalone: true,
  imports: [CommonModule, PlayableBoardDesktopComponent, BoardToolbarDesktopComponent, StatusMiniGridComponent, FeatureHeaderComponent],
  template: `
    <kq-feature-header
      eyebrow="Bingo"
      title="Happy crafting"
      titleTestId="page-bingo-title"
      subtitle="Klicke auf die Felder, um erledigte Projekte abzuhaken und ein Bingo zu erreichen."
    />

    <kq-board-toolbar-desktop
      [mode]="viewMode"
      [showPrintButton]="true"
      (modeChange)="modeChanged.emit($event)"
      (printClicked)="printClicked.emit()"
    >
      <kq-status-mini-grid
        [completed]="completed"
        [bingoCells]="bingoCells"
        [challengeNames]="challengeNames"
      />
    </kq-board-toolbar-desktop>

    <app-playable-board
      #playableBoard
      [challenges]="challenges"
      [completed]="completed"
      [bingoCells]="bingoCells"
      [mode]="viewMode"
      (toggled)="onToggle($event)"
      (cardDetailOpened)="cardDetailOpened.emit($event)"
    />
  `,
})
export class BingoGameDesktopComponent {
  private readonly state = inject(PLAY_BINGO_IN_PORT);

  @ViewChild('playableBoard') private readonly playableBoardRef?: PlayableBoardDesktopComponent;

  @Input() viewMode: BoardViewMode = 'polaroid';

  @Output() modeChanged = new EventEmitter<BoardViewMode>();
  @Output() printClicked = new EventEmitter<void>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();

  get challenges(): ChallengeProgress[] { return this.state.challenges(); }
  get completed(): boolean[] { return this.state.completed(); }
  get bingoCells(): Set<number> { return this.state.bingoCells(); }
  get challengeNames(): string[] { return this.challenges.map(c => c.name); }

  onToggle(i: number): void {
    this.state.persistToggledChallenge(i);
  }

  async refreshImage(imageId: string | null): Promise<void> {
    await this.playableBoardRef?.refreshImage(imageId);
  }
}
