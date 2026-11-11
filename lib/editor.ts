import '@duetds/date-picker/dist/duet/themes/default.css';
import './style.css';
import type {
  EditorBase,
  EditCell,
  VNode,
  HyperFunc,
} from '@revolist/revogrid';
import {
  createDate,
  isoAdapter,
  isoDate,
  maskDateInput,
} from './keyboard-input';
import type { DateChangeEvent, DateConfig } from './type';

function updatePosition(
  cellPosition: DOMRect,
  inputElement: HTMLElement,
  appendTo: Element,
) {
  inputElement.style.transform = `translate(${cellPosition.left}px, ${cellPosition.top}px)`;
  inputElement.style.width = `${cellPosition.width}px`;
  inputElement.style.height = `${cellPosition.height}px`;
  appendTo.append(inputElement);
}

export class ColumnEditor implements EditorBase {
  private calendar: HTMLDuetDatePickerElement;
  private revoFloat: HTMLElement;
  private input?: HTMLInputElement;
  private initializing = false;
  private disposed = false;
  private calendarOpen = false;
  private typing = false;
  private composing = false;
  private disposeInput?: () => void;
  private cancelReady?: () => void;
  private get keyboardFirst() {
    return this.data.column.openCalendarOnEdit === false;
  }

  constructor(
    //
    private data: DateConfig,
    // to save changes
    private saveCallback: (value: any, preventFocus?: boolean) => void,
    // to close editor, if focusNext true, after close editor focus on next cell
    private closeCallback: (focusNext?: boolean) => void = () => {},
  ) {}

  element?: HTMLElement | null;
  editCell?: EditCell;

  componentDidRender() {
    if (!this.element || !this.revoFloat) {
      return;
    }
    const appendTo =
      !this.data.column.appendTo || this.data.column.appendTo == 'body'
        ? document.body
        : this.data.column.appendTo;

    updatePosition(
      this.element.getBoundingClientRect(),
      this.revoFloat,
      appendTo,
    );
    if (!this.keyboardFirst) {
      this.calendar?.show();
      return;
    }
    if (!this.initializing) {
      this.initializing = true;
      void this.focusInput();
    }
  }

  private async focusInput() {
    const calendar = this.calendar;
    // Duet's custom-element build has no componentOnReady method. Wait for its
    // public light-DOM input before calling its documented focus API.
    const input =
      calendar.querySelector('input') ??
      (await new Promise<HTMLInputElement | null>((resolve) => {
        const finish = (input: HTMLInputElement | null) => {
          observer.disconnect();
          this.cancelReady = undefined;
          resolve(input);
        };
        const observer = new MutationObserver(() => {
          const input = calendar.querySelector('input');
          if (input) finish(input);
        });
        this.cancelReady = () => finish(null);
        observer.observe(calendar, { childList: true, subtree: true });
      }));
    if (this.disposed || this.calendar !== calendar) return;
    // Duet exposes focus, but no public selection or input-event extension hook.
    if (!input) return;
    this.input = input;
    const normalize = (event: Event) => {
      if (event.target !== input) return;
      this.typing = true;
      if (
        !this.composing &&
        !(event as InputEvent).isComposing &&
        this.data.column.inputMask
      )
        maskDateInput(input);
      this.validate();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.target !== input || this.composing || event.isComposing) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closeCallback(false);
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        if (!this.validate()) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        this.saveCallback(this.getValue(), event.key === 'Tab');
      }
    };
    const focus = (event: FocusEvent) => {
      this.typing = event.target === input;
    };
    const start = () => {
      this.composing = true;
    };
    const end = () => {
      this.composing = false;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    calendar.addEventListener('input', normalize, true);
    calendar.addEventListener('keydown', keydown, true);
    calendar.addEventListener('focusin', focus);
    input.addEventListener('compositionstart', start);
    input.addEventListener('compositionend', end);
    this.disposeInput = () => {
      calendar.removeEventListener('input', normalize, true);
      calendar.removeEventListener('keydown', keydown, true);
      calendar.removeEventListener('focusin', focus);
      input.removeEventListener('compositionstart', start);
      input.removeEventListener('compositionend', end);
    };
    await calendar.setFocus();
    if (!this.disposed && this.data.column.selectOnFocus !== false)
      input.select();
  }

  private parsedDate(): Date | undefined {
    const text = this.input?.value ?? '';
    const adapter = this.data.column.inputMask
      ? isoAdapter
      : this.calendar.dateAdapter;
    return adapter.parse(text, createDate);
  }
  private validate(): boolean {
    if (!this.input || this.composing) return false;
    const text = this.input.value;
    const date = this.parsedDate();
    const value = date && isoDate(date);
    const valid =
      !this.calendar.disabled &&
      (text === ''
        ? !this.calendar.required
        : !!date &&
          !isNaN(date.getTime()) &&
          (!this.calendar.min || value! >= this.calendar.min) &&
          (!this.calendar.max || value! <= this.calendar.max) &&
          !this.calendar.isDateDisabled(date));
    const message = valid
      ? ''
      : (this.data.column.invalidDateMessage ?? 'Enter a valid date.');
    this.input.setCustomValidity(message);
    this.input.setAttribute('aria-invalid', String(!valid));
    this.input.title = message;
    return valid;
  }
  beforeAutoSave() {
    return !this.keyboardFirst || this.validate();
  }

  private isDate(value: any): value is Date {
    return (
      Object.prototype.toString.call(value) === '[object Date]' &&
      !isNaN(value.getTime())
    );
  }

  getValue() {
    if (!this.keyboardFirst || !this.input) return this.calendar?.value;
    const date = this.parsedDate();
    return this.data.column.valueAsDate
      ? (date ?? null)
      : date
        ? isoDate(date)
        : '';
  }

  disconnectedCallback() {
    this.disposed = true;
    this.cancelReady?.();
    this.disposeInput?.();
    this.input = undefined;
    this.calendar?.hide();
    this.revoFloat?.remove();
    this.calendar = null;
    this.revoFloat = null;
  }

  render(h: HyperFunc<VNode>) {
    let val = '';
    if (this.editCell) {
      const model = this.editCell.model || {};
      val = model[this.editCell?.prop] || '';
    }
    if (this.isDate(val)) {
      val = val.toISOString().split('T')[0];
    }

    return h('div', { class: 'revo-holder' }, [
      h(
        'div',
        {
          class: 'revo-float',
          onMouseUp: (e: MouseEvent) => {
            // this is required to keep focus on grid
            e.stopPropagation();
          },
          ref: (e: HTMLElement) => (this.revoFloat = e),
        },
        [
          h('duet-date-picker', {
            ...this.data.column,
            ...(this.data.column.inputMask ? { dateAdapter: isoAdapter } : {}),
            ref: (e: HTMLDuetDatePickerElement) => (this.calendar = e),
            value: val,

            onDuetChange: ({
              detail: { value, valueAsDate },
            }: CustomEvent<DateChangeEvent>) => {
              if (this.keyboardFirst && (!this.calendarOpen || this.typing))
                return;
              this.saveCallback(
                this.data.column.valueAsDate ? valueAsDate : value,
              );
            },
            onDuetClose: () => {
              this.calendarOpen = false;
            },
            onDuetOpen: () => {
              this.calendarOpen = true;
              this.typing = false;
              const { bottom } = this.revoFloat?.getBoundingClientRect() || {};
              const { clientHeight } = document.body;
              const position = bottom + 300 > clientHeight ? 'top' : 'bottom';
              this.calendar?.setAttribute('position', position);
            },
          }),
        ],
      ),
    ]);
  }
}
