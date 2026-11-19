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
  private inputObserver?: MutationObserver;

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
    } else if (!this.input && !this.inputObserver && !this.focusInput()) {
      // Duet renders its light-DOM input asynchronously.
      this.inputObserver = new MutationObserver(() => this.focusInput());
      this.inputObserver.observe(this.calendar, { childList: true, subtree: true });
    }
  }

  private focusInput() {
    const input = this.calendar.querySelector('input:not([type="hidden"])');
    if (!(input instanceof HTMLInputElement)) return false;

    this.inputObserver?.disconnect();
    this.inputObserver = undefined;
    this.input = input;
    this.calendar.addEventListener('input', this.onInput, true);
    input.addEventListener('keydown', this.onKeyDown);
    void this.calendar.setFocus().then(() => {
      if (this.input === input && this.data.column.selectOnFocus !== false) {
        input.select();
      }
    });
    return true;
  }

  private onInput = (event: Event) => {
    const input = this.input;
    if (!input || event.target !== input) return;

    // Keep text edits staged. Duet would otherwise emit a change immediately.
    event.stopPropagation();
    input.removeAttribute('aria-invalid');
    if (this.data.column.inputMask && !(event as InputEvent).isComposing) {
      maskDateInput(input);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeCallback(false);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      const value = this.getValue();
      if (value === undefined) {
        event.preventDefault();
        event.stopPropagation();
        this.input?.setAttribute('aria-invalid', 'true');
        return;
      }
      this.saveCallback(value, event.key === 'Tab');
    }
  };

  private storageValue(value: string) {
    if (!this.data.column.valueAsDate) return value;
    // The editor renders Date values using their UTC calendar day.
    return value ? new Date(value + 'T00:00:00.000Z') : null;
  }

  beforeAutoSave(value: unknown) {
    return !this.keyboardFirst || value !== undefined;
  }

  private isDate(value: any): value is Date {
    return (
      Object.prototype.toString.call(value) === '[object Date]' &&
      !isNaN(value.getTime())
    );
  }

  getValue() {
    if (!this.keyboardFirst) return this.calendar?.value;
    if (!this.input || this.calendar.disabled) return undefined;

    const text = this.input.value;
    if (!text) return this.calendar.required ? undefined : this.storageValue('');

    const { dateAdapter, inputMask } = this.data.column;
    const adapter = inputMask ? isoAdapter : dateAdapter ?? isoAdapter;
    const date = adapter.parse(text, createDate);
    if (!date || !this.isDate(date)) return undefined;

    const value = isoDate(date);
    const { min, max } = this.calendar;
    if (
      (min && value < min) ||
      (max && value > max) ||
      this.calendar.isDateDisabled(date)
    ) {
      return undefined;
    }
    return this.storageValue(value);
  }

  disconnectedCallback() {
    this.inputObserver?.disconnect();
    this.inputObserver = undefined;
    this.calendar?.removeEventListener('input', this.onInput, true);
    this.input?.removeEventListener('keydown', this.onKeyDown);
    this.input = undefined;
    this.calendar?.hide(this.keyboardFirst ? false : undefined);
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
            ...(this.keyboardFirst && this.data.column.inputMask
              ? { dateAdapter: isoAdapter }
              : {}),
            ref: (e: HTMLDuetDatePickerElement) => (this.calendar = e),
            value: val,

            onDuetChange: ({
              detail: { value, valueAsDate },
            }: CustomEvent<DateChangeEvent>) => {
              const stored = this.keyboardFirst
                ? this.storageValue(value)
                : this.data.column.valueAsDate ? valueAsDate : value;
              this.saveCallback(stored);
            },
            onDuetOpen: () => {
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
