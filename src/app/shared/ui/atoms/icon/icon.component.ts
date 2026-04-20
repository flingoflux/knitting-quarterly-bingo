import { Component, Input, OnChanges } from '@angular/core';

export type KqIconName =
  | 'home'
  | 'shuffle'
  | 'play'
  | 'polaroid'
  | 'horizontal'
  | 'camera'
  | 'upload'
  | 'delete'
  | 'edit'
  | 'check'
  | 'star'
  | 'close';

const ICONS: Record<KqIconName, string> = {
  home: `<path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M21 22H3"/>`,
  shuffle: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
  play: `<polygon points="5 3 19 12 5 21 5 3"/>`,
  polaroid: `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="16" x2="21" y2="16"/>`,
  horizontal: `<rect x="2" y="3" width="7" height="7" rx="1"/><line x1="12" y1="6.5" x2="22" y2="6.5"/><rect x="2" y="14" width="7" height="7" rx="1"/><line x1="12" y1="17.5" x2="22" y2="17.5"/>`,
  camera: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  delete: `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>`,
  edit: `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
};

@Component({
  selector: 'kq-icon',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="'0 0 24 24'"
      [attr.width]="size"
      [attr.height]="size"
      fill="none"
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
  @Input({ required: true }) name!: KqIconName;
  @Input() size: number = 20;
  @Input() strokeWidth: number = 2;

  /** Für Stern-Icon: fill benötigt */
  @Input() filled = false;

  svgContent = '';

  ngOnChanges(): void {
    const paths = ICONS[this.name] ?? '';
    this.svgContent = paths;
  }
}
