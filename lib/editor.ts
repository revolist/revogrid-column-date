import './style.css';
import type { EditCell, EditorBase, HyperFunc, VNode } from '@revolist/revogrid';
import { calendarIcon, mountCalendar, unmountCalendar } from './calendar';
import { takeCalendarRequest } from './calendar-request';
import { createDate, isDate, isoAdapter, isoDate, maskDateInput, parseIsoDate, utcDate } from './keyboard-input';
import type { DateConfig } from './type';

export class ColumnEditor implements EditorBase {
  private revoFloat?: HTMLElement;
  private input?: HTMLInputElement;
  private dialog?: HTMLDialogElement;
  private picker?: HTMLElement;
  private toggle?: HTMLButtonElement;
  private initialized = false;

  element?: HTMLElement | null;
  editCell?: EditCell;

  constructor(
    private data: DateConfig,
    private saveCallback: (value: any, preventFocus?: boolean) => void,
    private closeCallback: (focusNext?: boolean) => void = () => {},
  ) {}

  private get keyboardFirst() {
    return this.data.column.openCalendarOnEdit === false;
  }

  private get adapter() {
    const { dateAdapter, inputMask } = this.data.column;
    return this.keyboardFirst && inputMask ? isoAdapter : dateAdapter ?? isoAdapter;
  }

  private get originalValue() {
    return this.editCell?.model?.[this.editCell.prop];
  }

  private get originalIsoValue(): string {
    const value = this.originalValue;
    return isDate(value) ? utcDate(value) : value == null ? '' : String(value);
  }

  componentDidRender() {
    if (!this.element || !this.revoFloat || !this.input) return;
    const { appendTo } = this.data.column;
    const parent = !appendTo || appendTo === 'body' ? this.element.ownerDocument.body : appendTo;
    const { left, top, width, height } = this.element.getBoundingClientRect();
    this.revoFloat.style.transform = `translate(${left}px, ${top}px)`;
    this.revoFloat.style.width = `${width}px`;
    this.revoFloat.style.height = `${height}px`;
    if (this.revoFloat.parentElement !== parent) {
      const style = this.element.ownerDocument.defaultView?.getComputedStyle(this.element);
      if (style) {
        this.revoFloat.style.fontFamily = style.fontFamily;
        this.revoFloat.style.fontSize = style.fontSize;
        this.revoFloat.style.lineHeight = style.lineHeight;
        this.revoFloat.classList.toggle('revo-date-editor-dark', style.colorScheme === 'dark');
      }
      parent.append(this.revoFloat);
    }
    if (this.initialized) return;
    this.initialized = true;

    if (!this.keyboardFirst || takeCalendarRequest(this.element, this.data)) {
      this.openCalendar();
      return;
    }

    this.input.focus({ preventScroll: true });
    const entered = this.editCell?.val;
    if (typeof entered === 'string' && entered && entered !== this.data.value) {
      this.input.value = entered;
      if (this.data.column.inputMask) maskDateInput(this.input);
    } else if (this.data.column.selectOnFocus !== false) {
      this.input.select();
    }
  }

  private openCalendar = () => {
    const { dialog, picker, input, revoFloat } = this;
    const column = this.data.column;
    if (!dialog || !picker || !input || !revoFloat || dialog.open || column.disabled) return;
    const draft = this.getDate(input.value);
    const date = draft ? isoDate(draft) : this.originalIsoValue;
    mountCalendar(picker, column, date, (value) => {
      const selected = parseIsoDate(value);
      if (!selected) return;
      dialog.close();
      this.saveCallback(this.storageValue(selected));
    });

    dialog.showModal();
    this.toggle?.setAttribute('aria-expanded', 'true');
    const anchor = revoFloat.getBoundingClientRect();
    const { width, height } = dialog.getBoundingClientRect();
    const viewport = dialog.ownerDocument.documentElement;
    const top = anchor.bottom + height <= viewport.clientHeight
      ? anchor.bottom
      : Math.max(0, anchor.top - height);
    const left = column.direction === 'left' ? anchor.right - width : anchor.left;
    dialog.style.top = `${top}px`;
    dialog.style.left = `${Math.max(0, Math.min(left, viewport.clientWidth - width))}px`;
  };

  private onCalendarClose = () => {
    if (this.dialog?.open) return;
    if (this.picker) unmountCalendar(this.picker);
    this.toggle?.setAttribute('aria-expanded', 'false');
    this.input?.focus({ preventScroll: true });
  };

  private onInput = (event: InputEvent) => {
    const input = this.input;
    if (!input || event.isComposing) return;
    input.removeAttribute('aria-invalid');
    if (this.keyboardFirst) {
      if (this.data.column.inputMask) maskDateInput(input);
    } else {
      const value = this.getValue();
      if (value !== undefined) this.saveCallback(value);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.isComposing) {
      event.stopPropagation();
      return;
    }
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.openCalendar();
    } else if (event.key === 'Delete' && this.keyboardFirst && this.data.column.inputMask) {
      const input = this.input;
      const caret = input?.selectionStart;
      if (input && caret != null && caret === input.selectionEnd && input.value[caret] === '-') {
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

  private getDate(text: string) {
    const date = this.adapter.parse(text, createDate);
    if (!isDate(date) || date.getFullYear() < 100 || date.getFullYear() > 9999) return undefined;
    const value = isoDate(date);
    const column = this.data.column;
    if ((column.min && value < column.min) ||
        (column.max && value > column.max) ||
        column.isDateDisabled?.(date)) return undefined;
    return date;
  }

  private storageValue(date: Date) {
    const value = isoDate(date);
    if (!this.data.column.valueAsDate) return value;
    if (!this.keyboardFirst) return date;

    const original = this.originalValue;
    if (isDate(original) && utcDate(original) === value) return original;
    return new Date(value + 'T00:00:00.000Z');
  }

  beforeAutoSave(value: unknown) {
    return value !== undefined;
  }

  getValue() {
    const column = this.data.column;
    if (!this.input || column.disabled) return undefined;
    if (!this.input.value) {
      return column.required ? undefined : column.valueAsDate ? null : '';
    }
    const date = this.getDate(this.input.value);
    return date ? this.storageValue(date) : undefined;
  }

  disconnectedCallback() {
    this.input = undefined;
    this.dialog?.close();
    if (this.picker) unmountCalendar(this.picker);
    this.revoFloat?.remove();
    this.picker = this.toggle = this.dialog = this.revoFloat = undefined;
  }

  render(h: HyperFunc<VNode>) {
    const { column } = this.data;
    const date = parseIsoDate(this.originalIsoValue);
    const text = column.localization ?? {};
    const label = text.buttonLabel ?? 'Choose date';
    return h('div', { class: 'revo-holder' }, [
      h('div', {
        class: 'revo-float revo-date-editor',
        onMouseUp: (event: MouseEvent) => event.stopPropagation(),
        ref: (el: HTMLElement) => { this.revoFloat = el; },
      }, [
        h('input', {
          class: 'revo-date-input',
          type: 'text',
          id: column.identifier,
          name: column.name,
          role: column.role,
          placeholder: text.placeholder ?? 'YYYY-MM-DD',
          'aria-label': text.placeholder ?? 'YYYY-MM-DD',
          disabled: column.disabled,
          required: column.required,
          autocomplete: 'off',
          value: date ? this.adapter.format(date) : this.originalIsoValue,
          ref: (el: HTMLInputElement) => { this.input = el; },
          onInput: this.onInput,
          onKeyDown: this.onKeyDown,
        }),
        h('button', {
          type: 'button',
          class: 'revo-date-toggle',
          'aria-label': label,
          'aria-haspopup': 'dialog',
          'aria-expanded': 'false',
          disabled: column.disabled,
          innerHTML: calendarIcon,
          ref: (el: HTMLButtonElement) => { this.toggle = el; },
          onClick: this.openCalendar,
        }),
        h('dialog', {
          class: 'revo-date-dialog',
          'aria-label': text.calendarHeading ?? label,
          ref: (el: HTMLDialogElement) => { this.dialog = el; },
          onKeyDown: (event: KeyboardEvent) => event.stopPropagation(),
          onClose: this.onCalendarClose,
          onClick: (event: MouseEvent) => {
            if (event.target === this.dialog) {
              const { top, right, bottom, left } = this.dialog.getBoundingClientRect();
              if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
                this.dialog.close();
              }
            }
          },
        }, [
          h('div', { ref: (el: HTMLElement) => { this.picker = el; } }),
        ]),
      ]),
    ]);
  }
}
