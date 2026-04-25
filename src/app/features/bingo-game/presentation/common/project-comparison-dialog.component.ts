import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../../shared/ports/image-repository';
import { IconComponent } from '../../../../shared/ui';
import { DialogShellComponent } from '../../../../shared/ui';
import type { ImageChangedEvent } from '../../../../shared/ui';

interface CropState {
  imgSrc: string;
  naturalW: number;
  naturalH: number;
  canvasSize: number;
  cropX: number;
  cropY: number;
  cropSize: number;
  dragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragOriginX: number;
  dragOriginY: number;
}

@Component({
  selector: 'app-project-comparison-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent, DialogShellComponent],
  template: `
    <kq-dialog-shell #shell [title]="title" maxWidth="min(94vw, 680px)" (closed)="onShellClosed()">

        <!-- Crop-Modus -->
        <ng-container *ngIf="cropState">
          <p class="crop-hint">Bildausschnitt verschieben, dann bestätigen</p>
          <div class="crop-wrap">
            <canvas #cropCanvas
              [width]="cropState.canvasSize"
              [height]="cropState.canvasSize"
              class="crop-canvas"
              (mousedown)="onCropDragStart($event)"
              (mousemove)="onCropDragMove($event)"
              (mouseup)="onCropDragEnd()"
              (mouseleave)="onCropDragEnd()"
              (touchstart)="onCropTouchStart($event)"
              (touchmove)="onCropTouchMove($event)"
              (touchend)="onCropDragEnd()"
            ></canvas>
          </div>
          <div class="crop-actions">
            <button class="confirm-btn" type="button" (click)="onCropConfirm()">
              <kq-icon name="check" [size]="16" [strokeWidth]="2.5"/>
              Zuschnitt übernehmen
            </button>
            <button class="cancel-crop-btn" type="button" (click)="onCropCancel()">Abbrechen</button>
          </div>
        </ng-container>

        <!-- Vergleichsansicht -->
        <ng-container *ngIf="!cropState">
          <div class="comparison-grid">

            <!-- Plan-Spalte (nur lesen) -->
            <div class="image-col">
              <div class="col-label">Plan</div>
              <div class="image-area">
                <img *ngIf="definitionImageUrl" [src]="definitionImageUrl" class="preview-img" [alt]="title" />
                <div *ngIf="!definitionImageUrl && !loadingDefinition" class="placeholder">
                  <kq-icon name="camera" [size]="36" [strokeWidth]="1.3" class="placeholder-icon"/>
                  <p class="placeholder-text">Kein Foto geplant</p>
                </div>
                <div *ngIf="loadingDefinition" class="loading">Lädt…</div>
              </div>
            </div>

            <!-- Spiel-Spalte (editierbar) -->
            <div class="image-col">
              <div class="col-label">Quarterly</div>
              <div class="image-area">
                <img *ngIf="gameImageUrl && !loadingGame" [src]="gameImageUrl" class="preview-img" [alt]="title" />
                <div *ngIf="!gameImageUrl && !loadingGame" class="placeholder">
                  <kq-icon name="camera" [size]="36" [strokeWidth]="1.3" class="placeholder-icon"/>
                  <p class="placeholder-text">Noch kein Foto</p>
                </div>
                <div *ngIf="loadingGame" class="loading">Lädt…</div>
              </div>
              <div class="actions">
                <label class="upload-btn" [class.is-replace]="!!gameImageUrl">
                  <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
                  <kq-icon name="upload" [size]="14"/>
                  {{ gameImageUrl ? 'Ersetzen' : 'Foto hochladen' }}
                </label>
                <button *ngIf="gameImageUrl" class="delete-btn" type="button" (click)="onDelete()">
                  <kq-icon name="delete" [size]="14"/>
                  Entfernen
                </button>
              </div>
            </div>

          </div>
        </ng-container>
    </kq-dialog-shell>
  `,
  styles: [`
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .image-col {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .col-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #8f5c3a;
      text-align: center;
    }
    .image-area {
      background: var(--kq-placeholder-bg);
      border: 1.5px dashed var(--kq-placeholder-border);
      border-radius: 12px;
      aspect-ratio: 1 / 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 11px;
      display: block;
    }
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 1rem;
      color: var(--kq-placeholder-text);
      text-align: center;
    }
    .placeholder-icon {
      opacity: 0.4;
    }
    .placeholder-text {
      margin: 0;
      font-size: 0.78rem;
      color: var(--kq-muted-warm);
    }
    .loading {
      color: var(--kq-muted-warm);
      font-size: 0.85rem;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      align-items: stretch;
    }
    .upload-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.45rem 0.8rem;
      background: var(--kq-primary-dark);
      color: #fff;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.18s, transform 0.15s;
      text-align: center;
    }
    .upload-btn:hover {
      background: #5c2b18;
      transform: translateY(-1px);
    }
    .upload-btn.is-replace {
      background: #a05530;
    }
    .upload-btn.is-replace:hover {
      background: var(--kq-primary-dark);
    }
    .delete-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.45rem 0.8rem;
      background: transparent;
      color: var(--kq-primary-hover);
      border: 1.5px solid var(--kq-border-warm);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s, transform 0.15s;
    }
    .delete-btn:hover {
      background: var(--kq-bg-tint);
      border-color: #c4614a;
      transform: translateY(-1px);
    }
    /* Crop */
    .crop-hint {
      margin: 0;
      text-align: center;
      font-size: 0.85rem;
      color: var(--kq-muted-warm);
    }
    .crop-wrap {
      display: flex;
      justify-content: center;
    }
    .crop-canvas {
      border-radius: 12px;
      cursor: move;
      touch-action: none;
      max-width: 100%;
    }
    .crop-actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .confirm-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1.1rem;
      background: #4a7b22;
      color: #fff;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.18s, transform 0.15s;
    }
    .confirm-btn:hover {
      background: #355c18;
      transform: translateY(-1px);
    }
    .cancel-crop-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1.1rem;
      background: transparent;
      color: var(--kq-primary-hover);
      border: 1.5px solid var(--kq-border-warm);
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s;
    }
    .cancel-crop-btn:hover {
      background: var(--kq-bg-tint);
      border-color: #c4614a;
    }
    @media (max-width: 480px) {
      .comparison-grid {
        grid-template-columns: 1fr;
      }
      .panel {
        padding: 1.6rem 1rem 1.2rem;
      }
    }
  `],
})
export class ProjectComparisonDialogComponent {
  @ViewChild('shell') private readonly shell!: DialogShellComponent;
  @ViewChild('cropCanvas') private readonly cropCanvasEl?: ElementRef<HTMLCanvasElement>;

  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);
  private readonly cdr = inject(ChangeDetectorRef);

  @Output() imageChanged = new EventEmitter<ImageChangedEvent>();

  title = '';
  definitionImageUrl: string | null = null;
  gameImageUrl: string | null = null;
  loadingDefinition = false;
  loadingGame = false;
  cropState: CropState | null = null;

  private currentGameImageId: string | null = null;
  private currentDefinitionImageId: string | null = null;
  private pendingFileInputRef: HTMLInputElement | null = null;

  async open(title: string, definitionImageId: string | null, gameImageId: string | null): Promise<void> {
    this.title = title;
    this.currentDefinitionImageId = definitionImageId;
    this.currentGameImageId = gameImageId;
    this.definitionImageUrl = null;
    this.gameImageUrl = null;
    this.cropState = null;
    this.loadingDefinition = !!definitionImageId;
    this.loadingGame = !!gameImageId;
    this.shell.open();
    this.cdr.markForCheck();

    const [defUrl, gameUrl] = await Promise.all([
      definitionImageId ? this.imageRepo.getImage(definitionImageId) : Promise.resolve(null),
      gameImageId ? this.imageRepo.getImage(gameImageId) : Promise.resolve(null),
    ]);
    this.definitionImageUrl = defUrl;
    this.gameImageUrl = gameUrl;
    this.loadingDefinition = false;
    this.loadingGame = false;
    this.cdr.markForCheck();
  }

  close(): void {
    this.shell.close();
  }

  onShellClosed(): void {
    this.cropState = null;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.pendingFileInputRef = input;
    const imgSrc = await readFileAsDataUrl(file);
    const { naturalW, naturalH } = await getImageDimensions(imgSrc);

    if (naturalW !== naturalH) {
      const canvasSize = Math.min(360, Math.max(naturalW, naturalH));
      const minSide = Math.min(naturalW, naturalH);
      const scale = canvasSize / Math.max(naturalW, naturalH);
      const cropSize = Math.round(minSide * scale);
      const scaledW = Math.round(naturalW * scale);
      const scaledH = Math.round(naturalH * scale);
      this.cropState = {
        imgSrc, naturalW, naturalH, canvasSize,
        cropX: Math.round((scaledW - cropSize) / 2),
        cropY: Math.round((scaledH - cropSize) / 2),
        cropSize, dragging: false,
        dragStartX: 0, dragStartY: 0, dragOriginX: 0, dragOriginY: 0,
      };
      this.cdr.markForCheck();
      setTimeout(() => this.drawCrop(), 0);
    } else {
      await this.saveImage(imgSrc);
      input.value = '';
    }
  }

  onCropDragStart(event: MouseEvent): void {
    if (!this.cropState) return;
    this.cropState.dragging = true;
    this.cropState.dragStartX = event.offsetX;
    this.cropState.dragStartY = event.offsetY;
    this.cropState.dragOriginX = this.cropState.cropX;
    this.cropState.dragOriginY = this.cropState.cropY;
  }

  onCropTouchStart(event: TouchEvent): void {
    if (!this.cropState || !this.cropCanvasEl) return;
    event.preventDefault();
    const rect = this.cropCanvasEl.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    this.cropState.dragging = true;
    this.cropState.dragStartX = touch.clientX - rect.left;
    this.cropState.dragStartY = touch.clientY - rect.top;
    this.cropState.dragOriginX = this.cropState.cropX;
    this.cropState.dragOriginY = this.cropState.cropY;
  }

  onCropDragMove(event: MouseEvent): void {
    if (!this.cropState?.dragging) return;
    this.moveCrop(event.offsetX, event.offsetY);
  }

  onCropTouchMove(event: TouchEvent): void {
    if (!this.cropState?.dragging || !this.cropCanvasEl) return;
    event.preventDefault();
    const rect = this.cropCanvasEl.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    this.moveCrop(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  onCropDragEnd(): void {
    if (this.cropState) this.cropState.dragging = false;
  }

  private moveCrop(x: number, y: number): void {
    if (!this.cropState) return;
    const { dragStartX, dragStartY, dragOriginX, dragOriginY, cropSize, canvasSize, naturalW, naturalH } = this.cropState;
    const scale = canvasSize / Math.max(naturalW, naturalH);
    const scaledW = Math.round(naturalW * scale);
    const scaledH = Math.round(naturalH * scale);
    const dx = x - dragStartX;
    const dy = y - dragStartY;
    this.cropState.cropX = Math.max(0, Math.min(scaledW - cropSize, dragOriginX + dx));
    this.cropState.cropY = Math.max(0, Math.min(scaledH - cropSize, dragOriginY + dy));
    this.drawCrop();
  }

  async onCropConfirm(): Promise<void> {
    if (!this.cropState) return;
    const { imgSrc, naturalW, naturalH, cropX, cropY, cropSize, canvasSize } = this.cropState;
    const scale = canvasSize / Math.max(naturalW, naturalH);
    const srcX = Math.round(cropX / scale);
    const srcY = Math.round(cropY / scale);
    const srcSize = Math.round(cropSize / scale);
    const croppedUrl = await cropImageToSquare(imgSrc, srcX, srcY, srcSize, 800);
    this.cropState = null;
    if (this.pendingFileInputRef) {
      this.pendingFileInputRef.value = '';
      this.pendingFileInputRef = null;
    }
    await this.saveImage(croppedUrl);
  }

  onCropCancel(): void {
    this.cropState = null;
    if (this.pendingFileInputRef) {
      this.pendingFileInputRef.value = '';
      this.pendingFileInputRef = null;
    }
    this.cdr.markForCheck();
  }

  private drawCrop(): void {
    const canvas = this.cropCanvasEl?.nativeElement;
    const state = this.cropState;
    if (!canvas || !state) return;
    const ctx = canvas.getContext('2d')!;
    const { canvasSize, naturalW, naturalH, cropX, cropY, cropSize, imgSrc } = state;
    const scale = canvasSize / Math.max(naturalW, naturalH);
    const scaledW = Math.round(naturalW * scale);
    const scaledH = Math.round(naturalH * scale);
    const offsetX = Math.round((canvasSize - scaledW) / 2);
    const offsetY = Math.round((canvasSize - scaledH) / 2);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(offsetX + cropX, offsetY + cropY, cropSize, cropSize);
      ctx.restore();
      ctx.drawImage(
        img,
        Math.round(cropX / scale), Math.round(cropY / scale),
        Math.round(cropSize / scale), Math.round(cropSize / scale),
        offsetX + cropX, offsetY + cropY, cropSize, cropSize,
      );
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX + cropX + 1, offsetY + cropY + 1, cropSize - 2, cropSize - 2);
    };
    img.src = imgSrc;
  }

  private async saveImage(dataUrl: string): Promise<void> {
    this.loadingGame = true;
    this.cdr.markForCheck();
    // Nie die Definition-Image überschreiben – neue UUID generieren wenn die Spiel-ID mit der Plan-ID identisch ist
    const newImageId =
      this.currentGameImageId && this.currentGameImageId !== this.currentDefinitionImageId
        ? this.currentGameImageId
        : generateUuid();
    await this.imageRepo.saveImage(newImageId, dataUrl);
    this.currentGameImageId = newImageId;
    this.gameImageUrl = dataUrl;
    this.loadingGame = false;
    this.imageChanged.emit({ imageId: newImageId });
    this.cdr.markForCheck();
  }

  async onDelete(): Promise<void> {
    if (this.currentGameImageId) {
      await this.imageRepo.deleteImage(this.currentGameImageId);
    }
    this.currentGameImageId = null;
    this.gameImageUrl = null;
    this.imageChanged.emit({ imageId: null });
    this.cdr.markForCheck();
  }
}

function generateUuid(): string {
  return crypto.randomUUID();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(src: string): Promise<{ naturalW: number; naturalH: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ naturalW: img.naturalWidth, naturalH: img.naturalHeight });
    img.src = src;
  });
}

function cropImageToSquare(src: string, srcX: number, srcY: number, srcSize: number, maxPx: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(srcSize, maxPx);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d')!.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = src;
  });
}
