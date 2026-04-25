import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../shared/domain/challenge';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { PlanEditCardMobileComponent } from './plan-edit-card-mobile.component';
import { MobileFabComponent, ChallengeCardMobileComponent, BoardGridMobileComponent, EditListMobileComponent } from '../../../../shared/ui';

interface ChallengeEditedEvent {
  index: number;
  challenge: Challenge;
}

interface CardDetailOpenedEvent {
  index: number;
  challenge: Challenge;
}

interface ReorderRequestedEvent {
  from: number;
  to: number;
}

@Component({
  selector: 'app-mobile-editable-board',
  standalone: true,
  imports: [CommonModule, PlanEditCardMobileComponent, MobileFabComponent, ChallengeCardMobileComponent, BoardGridMobileComponent, EditListMobileComponent],
  template: `
    <!-- Read-only Mini-Grid (4×4 Polaroids) -->
    @if (!editMode()) {
      <kq-board-grid-mobile>
        @for (p of challenges; track p.name; let i = $index) {
          <kq-challenge-card-mobile
            [name]="p.name"
            [imageUrl]="getImage(p.imageId)"
          />
        }
      </kq-board-grid-mobile>
    }

    <!-- Edit-Liste mit Umbenennungs-, Foto- und Sortierfunktion -->
    @if (editMode()) {
      <kq-edit-list-mobile>
        @for (p of challenges; track p.name; let i = $index) {
          <app-plan-mobile-edit-card
            [name]="p.name"
            [imageUrl]="getImage(p.imageId)"
            [isEditing]="editingIndex === i"
            [draftName]="getDraftName(i, p.name)"
            [isFirst]="i === 0"
            [isLast]="i === challenges.length - 1"
            (cameraClicked)="openDetail(i, p, $event)"
            (editToggled)="startEditing(i, p, $event)"
            (editCancelled)="cancelEditing()"
            (movedUp)="moveUp(i)"
            (movedDown)="moveDown(i)"
            (nameInput)="onDraftNameInput(i, $event)"
          />
        }
      </kq-edit-list-mobile>
    }

    <!-- FAB: Edit-Modus umschalten -->
    <kq-fab-mobile
      [active]="editMode()"
      inactiveLabel="Board bearbeiten"
      (clicked)="toggleEditMode()"
    />
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
  `],
})
export class EditableBoardMobileComponent {
  static readonly overviewSubtitle = 'Tippe auf eine Karte, um sie umzudrehen.';
  static readonly editSubtitle = 'Du kannst jetzt Projekte umbenennen, die Reihenfolge anpassen und Fotos bearbeiten.';

  private readonly el = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);

  private _challenges: Challenge[] = [];
  @Input() set challenges(value: Challenge[]) {
    this._challenges = value;
    void this.loadAllImages();
  }
  get challenges(): Challenge[] { return this._challenges; }

  @Output() challengeEdited = new EventEmitter<ChallengeEditedEvent>();
  @Output() cardDetailOpened = new EventEmitter<CardDetailOpenedEvent>();
  @Output() reorderRequested = new EventEmitter<ReorderRequestedEvent>();
  @Output() editModeChanged = new EventEmitter<boolean>();

  readonly editMode = signal(false);
  editingIndex: number | null = null;

  private readonly imageCache = new Map<string, string>();
  private readonly draftNames = new Map<number, string>();

  getImage(imageId: string | undefined): string | null {
    if (!imageId) return null;
    return this.imageCache.get(imageId) ?? null;
  }

  async refreshImage(imageId: string | null): Promise<void> {
    if (!imageId) return;
    const url = await this.imageRepo.getImage(imageId);
    if (url) {
      this.imageCache.set(imageId, url);
    } else {
      this.imageCache.delete(imageId);
    }
    this.cdr.markForCheck();
  }

  toggleEditMode(): void {
    if (this.editMode() && this.editingIndex !== null) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
    const nextMode = !this.editMode();
    this.editMode.set(nextMode);
    this.editModeChanged.emit(nextMode);
  }

  moveUp(i: number): void {
    if (i <= 0) return;
    this.reorderRequested.emit({ from: i, to: i - 1 });
  }

  moveDown(i: number): void {
    if (i >= this._challenges.length - 1) return;
    this.reorderRequested.emit({ from: i, to: i + 1 });
  }

  startEditing(i: number, challenge: Challenge, event: MouseEvent): void {
    event.stopPropagation();
    if (this.editingIndex === i) {
      this.saveAndExit(i, challenge);
      return;
    }
    if (this.editingIndex !== null) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
    this.editingIndex = i;
    this.draftNames.set(i, challenge.name);
  }

  cancelEditing(): void {
    this.editingIndex = null;
  }

  openDetail(i: number, challenge: Challenge, event: MouseEvent): void {
    event.stopPropagation();
    this.cardDetailOpened.emit({ index: i, challenge });
  }

  getDraftName(i: number, fallback: string): string {
    return this.draftNames.get(i) ?? fallback;
  }

  onDraftNameInput(i: number, value: string): void {
    this.draftNames.set(i, value);
  }

  saveAndExit(i: number, challenge: Challenge): void {
    const draftName = this.getDraftName(i, challenge.name).trim();
    const name = draftName.length > 0 ? draftName : challenge.name;
    const updated: Challenge = { name, imageId: challenge.imageId };
    if (updated.name !== challenge.name || updated.imageId !== challenge.imageId) {
      this.challengeEdited.emit({ index: i, challenge: updated });
    }
    this.editingIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.editingIndex === null) return;
    const target = event.target as Node;
    const cards = this.el.nativeElement.querySelectorAll('app-plan-mobile-edit-card');
    const editingCard = cards[this.editingIndex] as HTMLElement | undefined;
    if (editingCard && !editingCard.contains(target)) {
      this.saveAndExit(this.editingIndex, this._challenges[this.editingIndex]);
    }
  }

  private async loadAllImages(): Promise<void> {
    const imageIds = this._challenges
      .map(c => c.imageId)
      .filter((id): id is string => !!id);
    const uniqueIds = [...new Set(imageIds)];
    await Promise.all(
      uniqueIds.map(async id => {
        const url = await this.imageRepo.getImage(id);
        if (url) {
          this.imageCache.set(id, url);
        } else {
          this.imageCache.delete(id);
        }
      })
    );
    this.cdr.markForCheck();
  }
}
