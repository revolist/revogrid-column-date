import '@duetds/date-picker/dist/duet/themes/default.css';
import './style.css';
import type {
  EditorBase,
  EditCell,
  VNode,
  HyperFunc,
} from '@revolist/revogrid';
import type { DateChangeEvent, DateConfig } from './type';

function updatePosition(
  cellPosition: DOMRect,
  inputElement: HTMLElement,
  appendTo: Element,
  calendar?: HTMLDuetDatePickerElement,
) {
  inputElement.style.transform = `translate(${cellPosition.left}px, ${cellPosition.top}px)`;
  inputElement.style.width = `${cellPosition.width}px`;
  inputElement.style.height = `${cellPosition.height}px`;
  appendTo.append(inputElement);
  calendar?.show();
}

export class ColumnEditor implements EditorBase {
  private calendar: HTMLDuetDatePickerElement;
  private revoFloat: HTMLElement;
  constructor(
    //
    private data: DateConfig,
    // to save changes
    private saveCallback: (value: any, preventFocus?: boolean) => void,
    // to close editor, if focusNext true, after close editor focus on next cell
    // private closeCallback: (focusNext?: boolean) => void
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
      this.calendar,
    );
  }

  private isDate(value: any): value is Date {
    return Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime());
  }

  getValue() {
    return this.calendar?.value;
  }

  disconnectedCallback() {
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
            ref: (e: HTMLDuetDatePickerElement) => (this.calendar = e),
            value: val,

            onDuetChange: ({
              detail: { value, valueAsDate },
            }: CustomEvent<DateChangeEvent>) =>
              this.saveCallback(this.data.column.valueAsDate ? valueAsDate : value),
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
