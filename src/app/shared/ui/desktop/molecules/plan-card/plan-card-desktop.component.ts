import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Schlichte Plankarte für den Planungsmodus.
 * Kein Foto, kein Polaroid-Look: nur zentrierter, direkt editierbarer Projektname.
 */
@Component({
  selector: 'kq-plan-card-desktop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" data-testid="plan-card-desktop">
      <div class="inner-square">
        <textarea
          class="name-input"
          [value]="value"
          [placeholder]="placeholder"
          aria-label="Projektname"
          rows="4"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (keydown.enter)="onEnter($event)"
          (dragstart)="$event.stopPropagation()"
        ></textarea>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .card {
      height: 100%;
      background: #fff;
      border: 1px solid #e8dfd4;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(60, 30, 10, 0.14), 0 8px 20px rgba(60, 30, 10, 0.10);
      padding: 0.6rem;
    }

    .inner-square {
      width: 100%;
      height: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 8px;
      background: var(--kq-photo-bg);
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .name-input {
      width: 100%;
      min-height: 2.6em;
      max-height: 100%;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--kq-text-warm);
      font-size: 0.9rem;
      font-weight: 650;
      line-height: 1.25;
      text-align: center;
      padding: 0.35rem 0.45rem;
      outline: none;
      resize: none;
      overflow-y: auto;
      overflow-wrap: anywhere;
      word-break: break-word;
      white-space: pre-wrap;
      font-family: inherit;
    }

    .name-input::placeholder {
      color: var(--kq-muted-warm);
      opacity: 0.9;
    }

    .name-input:focus-visible {
      border-color: rgba(196, 110, 53, 0.45);
      background: #fff9f2;
    }
  `],
})
export class PlanCardDesktopComponent {
  @Input({ required: true }) value!: string;
  @Input() placeholder = 'Projektname';

  @Output() valueChange = new EventEmitter<string>();
  @Output() valueCommitted = new EventEmitter<void>();

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }

  onBlur(): void {
    this.valueCommitted.emit();
  }

  onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    target.blur();
  }
}
