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
  isDate,
  isoAdapter,
  isoDate,
  maskDateInput,
  utcDate,
} from './keyboard-input';
import type { DateChangeEvent, DateConfig } from './type';
import { takeCalendarRequest } from './calendar-request';

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

  private get originalValue() {
    return this.editCell?.model?.[this.editCell.prop];
  }

  private get originalIsoValue() {
    const value = this.originalValue;
    return isDate(value) ? utcDate(value) : value || '';
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
    if (takeCalendarRequest(this.element, this.data)) {
      void this.calendar.show();
      return true;
    }

    void this.calendar.setFocus().then(() => {
      if (this.input !== input) return;
      const entered = this.editCell?.val;
      if (typeof entered === 'string' && entered && entered !== this.data.value) {
        input.value = entered;
        if (this.data.column.inputMask) maskDateInput(input);
        return;
      }

      // Duet maps stored years 0001–0099 to the twentieth century.
      const original = this.originalIsoValue;
      if (typeof original === 'string' && /^00\d{2}-\d{2}-\d{2}$/.test(original)) {
        input.value = original;
      }
      if (this.data.column.selectOnFocus !== false) input.select();
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
    if (event.isComposing) {
      event.stopPropagation();
      return;
    }
    if (event.key === 'Delete' && this.data.column.inputMask) {
      const input = this.input;
      const caret = input?.selectionStart;
      if (
        input && caret != null && caret === input.selectionEnd &&
        input.value[caret] === '-'
      ) {
        input.setSelectionRange(caret + 1, caret + 1);
      }
    } else if (event.key === 'Escape') {
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
    if (!value) return null;

    const original = this.originalValue;
    if (isDate(original) && utcDate(original) === value) return original;
    return new Date(value + 'T00:00:00.000Z');
  }

  beforeAutoSave(value: unknown) {
    return !this.keyboardFirst || value !== undefined;
  }

  getValue() {
    if (!this.keyboardFirst) return this.calendar?.value;
    if (!this.input || this.calendar.disabled) return undefined;

    const text = this.input.value;
    if (!text) return this.calendar.required ? undefined : this.storageValue('');

    const { dateAdapter, inputMask } = this.data.column;
    const adapter = inputMask ? isoAdapter : dateAdapter ?? isoAdapter;
    const date = adapter.parse(text, createDate);
    if (!isDate(date) || date.getFullYear() < 100 || date.getFullYear() > 9999) {
      return undefined;
    }

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
            ...(this.keyboardFirst && (this.data.column.inputMask || !this.data.column.dateAdapter)
              ? { dateAdapter: isoAdapter }
              : {}),
            ref: (e: HTMLDuetDatePickerElement) => (this.calendar = e),
            value: this.originalIsoValue,

            onDuetChange: ({
              detail: { value, valueAsDate },
            }: CustomEvent<DateChangeEvent>) => {
              const stored = this.keyboardFirst
                ? this.storageValue(isoDate(valueAsDate))
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
