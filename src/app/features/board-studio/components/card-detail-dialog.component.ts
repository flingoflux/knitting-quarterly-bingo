import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRepository, IMAGE_REPOSITORY } from '../../../shared/ports/image-repository';

@Component({
  selector: 'app-card-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog #dialog (click)="onDialogClick($event)">
      <div class="panel">
        <button class="close-btn" type="button" (click)="close()" aria-label="Dialog schließen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h3 class="card-title">{{ title }}</h3>

        <div class="image-area">
          <img *ngIf="imageUrl && !loading" [src]="imageUrl" class="preview-img" [alt]="title" />
          <div *ngIf="!imageUrl && !loading" class="placeholder">
            <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="placeholder-icon">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <p class="placeholder-text">Noch kein Foto hochgeladen</p>
          </div>
          <div *ngIf="loading" class="loading">Lädt…</div>
        </div>

        <div class="actions">
          <label class="upload-btn" [class.is-replace]="!!imageUrl">
            <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ imageUrl ? 'Foto ersetzen' : 'Foto hochladen' }}
          </label>

          <button *ngIf="imageUrl" class="delete-btn" type="button" (click)="onDelete()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            Foto entfernen
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: [`
    dialog {
      border: none;
      border-radius: 20px;
      padding: 0;
      background: transparent;
      max-width: min(92vw, 480px);
      width: 100%;
      box-shadow: 0 24px 56px rgba(60, 30, 10, 0.28);
    }
    dialog::backdrop {
      background: rgba(40, 20, 8, 0.45);
      backdrop-filter: blur(2px);
    }
    .panel {
      background: #fffaf2;
      border-radius: 20px;
      padding: 2rem 1.6rem 1.6rem;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .close-btn {
      position: absolute;
      top: 0.9rem;
      right: 0.9rem;
      border: 1px solid #d9b998;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      background: #fff4e6;
      color: #7b3b22;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
    }
    .close-btn:hover {
      background: #ffe8cd;
      color: #532615;
    }
    .card-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #4a2d1c;
      text-align: center;
      padding-right: 2rem;
      text-wrap: balance;
    }
    .image-area {
      background: #fff3e4;
      border: 1.5px dashed #d0ab86;
      border-radius: 14px;
      min-height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 13px;
      display: block;
      max-height: 340px;
    }
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding: 2rem;
      color: #b08060;
    }
    .placeholder-icon {
      opacity: 0.45;
    }
    .placeholder-text {
      margin: 0;
      font-size: 0.9rem;
      color: #a07850;
    }
    .loading {
      color: #a07850;
      font-size: 0.9rem;
    }
    .actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1.1rem;
      background: #7b3b22;
      color: #fff;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.18s, transform 0.15s;
    }
    .upload-btn:hover {
      background: #5c2b18;
      transform: translateY(-1px);
    }
    .upload-btn.is-replace {
      background: #a05530;
    }
    .upload-btn.is-replace:hover {
      background: #7b3b22;
    }
    .delete-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1.1rem;
      background: transparent;
      color: #9b3a22;
      border: 1.5px solid #d9a088;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s, transform 0.15s;
    }
    .delete-btn:hover {
      background: #fde8df;
      border-color: #c4614a;
      transform: translateY(-1px);
    }
  `],
})
export class CardDetailDialogComponent {
  @ViewChild('dialog') private readonly dialogEl!: ElementRef<HTMLDialogElement>;

  private readonly imageRepo = inject<ImageRepository>(IMAGE_REPOSITORY);
  private readonly cdr = inject(ChangeDetectorRef);
  @Output() imageChanged = new EventEmitter<number>();

  title = '';
  imageUrl: string | null = null;
  loading = false;

  private cardIndex = -1;


  async open(cardIndex: number, title: string): Promise<void> {
    this.cardIndex = cardIndex;
    this.title = title;
    this.imageUrl = null;
    this.loading = true;
    this.dialogEl.nativeElement.showModal();
    this.imageUrl = await this.imageRepo.getImage(cardIndex);
    this.loading = false;
    this.cdr.markForCheck();
  }

  close(): void {
    this.dialogEl.nativeElement.close();
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialogEl.nativeElement) {
      this.close();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loading = true;
    const dataUrl = await resizeImage(file, 800);
    await this.imageRepo.saveImage(this.cardIndex, dataUrl);
    this.imageUrl = dataUrl;
    this.loading = false;
    this.imageChanged.emit(this.cardIndex);
    this.cdr.markForCheck();
    input.value = '';
  }

  async onDelete(): Promise<void> {
    await this.imageRepo.deleteImage(this.cardIndex);
    this.imageUrl = null;
    this.imageChanged.emit(this.cardIndex);
    this.cdr.markForCheck();
  }
}

function resizeImage(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = objectUrl;
  });
}
