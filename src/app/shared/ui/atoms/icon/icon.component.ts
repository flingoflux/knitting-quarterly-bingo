import { Component, Input, OnChanges, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type KqIconName =
  | 'home'
  | 'shuffle'
  | 'plus-feather'
  | 'play'
  | 'chevron-left'
  | 'chevron-right'
  | 'polaroid'
  | 'horizontal'
  | 'print'
  | 'camera'
  | 'upload'
  | 'delete'
  | 'edit'
  | 'check'
  | 'star'
  | 'close'
  | 'question'
  | 'target'
  | 'layers'
  | 'award'
  | 'lightbulb'
  | 'alert-triangle'
  | 'settings-feather'
  | 'x-done'
  | 'x'
  | 'arrow-up'
  | 'arrow-down';

const ICONS: Record<KqIconName, string> = {
  home: `<path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M21 22H3"/>`,
  shuffle: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
  'plus-feather': `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  play: `<polygon points="5 3 19 12 5 21 5 3"/>`,
  'chevron-left': `<polyline points="15 18 9 12 15 6"/>`,
  'chevron-right': `<polyline points="9 18 15 12 9 6"/>`,
  polaroid: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="16" x2="21" y2="16"/>`,
  horizontal: `<rect x="2" y="3" width="7" height="7" rx="1"/><line x1="12" y1="6.5" x2="22" y2="6.5"/><rect x="2" y="14" width="7" height="7" rx="1"/><line x1="12" y1="17.5" x2="22" y2="17.5"/>`,
  print: `<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>`,
  camera: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  delete: `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>`,
  edit: `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  question: `<path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3"/><circle cx="12" cy="16.5" r="0.7" fill="currentColor"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
  layers: `<polygon points="12 2 22 7 12 12 2 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>`,
  award: `<circle cx="12" cy="8" r="6"/><polyline points="8.5 13.5 7 22 12 19 17 22 15.5 13.5"/>`,
  lightbulb: `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8 10a4 4 0 1 1 8 0c0 1.7-.8 2.8-1.7 3.8-.7.8-1.3 1.4-1.3 2.2h-2c0-.8-.6-1.4-1.3-2.2C8.8 12.8 8 11.7 8 10Z"/>`,
  'alert-triangle': `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/>`,
  'x-done': `<path d="M4,4.5 C6,7 11,14 20,19.5"/><path d="M20,4.5 C18,7 13,14 4,19.5"/>`,
  'settings-feather': `<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`,
  'x': `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  'arrow-up': `<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>`,
  'arrow-down': `<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>`,
};

@Component({
  selector: 'kq-icon',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="'0 0 24 24'"
      [attr.width]="size"
      [attr.height]="size"
      [attr.fill]="filled ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="'true'"
      [innerHTML]="svgContent"
    ></svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    svg {
      display: block;
      flex-shrink: 0;
    }
  `],
})
export class IconComponent implements OnChanges {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) name!: KqIconName;
  @Input() size: number = 20;
  @Input() strokeWidth: number = 2;

  /** Für Stern-Icon: fill benötigt */
  @Input() filled = false;

  svgContent: SafeHtml = '';

  ngOnChanges(): void {
    const paths = ICONS[this.name] ?? '';
    // Pfade sind hardcodierte Strings im Component – kein Nutzereingabe, daher sicher
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(paths);
  }
}
