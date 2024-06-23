import '@duetds/date-picker/dist/duet/themes/default.css';
import './style.css';
import { h } from '@stencil/core';
import { EditorBase, EditCell, VNode } from '@revolist/revogrid';
import { DateChangeEvent, DateConfig } from './type';

type DateChange = CustomEvent<DateChangeEvent>;

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
    private column: DateConfig,
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
      !this.column.appendTo || this.column.appendTo == 'body'
        ? document.body
        : this.column.appendTo;

    updatePosition(
      this.element.getBoundingClientRect(),
      this.revoFloat,
      appendTo,
      this.calendar,
    );
  }

  disconnectedCallback() {
    this.calendar?.hide();
    this.revoFloat?.remove();
    this.calendar = null;
    this.revoFloat = null;
  }

  render(): VNode {
    let val = '';
    if (this.editCell) {
      const model = this.editCell.model || {};
      val = model[this.editCell?.prop] || '';
    }
    return (
      <div class="revo-holder">
        <div
          class="revo-float"
          onMouseUp={(e: MouseEvent) => {
            // this is required to keep focus on grid
            e.stopPropagation();
          }}
          ref={(e: HTMLElement) => (this.revoFloat = e)}
        >
          <duet-date-picker
            {...this.column}
            ref={(e: HTMLDuetDatePickerElement) => (this.calendar = e)}
            value={val}
            onDuetChange={({ detail: { value, valueAsDate } }: DateChange) =>
              this.saveCallback(this.column.valueAsDate ? valueAsDate : value)
            }
          />
        </div>
      </div>
    );
  }
}
