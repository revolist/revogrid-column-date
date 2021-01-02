import '@duetds/date-picker/dist/duet/themes/default.css';
import './style.css';
import {Edition} from '@revolist/revogrid/dist/types/interfaces';
import { DateChangeEvent, DateConfig } from './type';

type DateChange = CustomEvent<DateChangeEvent>;

export class ColumnEditor implements Edition.EditorBase {
    private calendar: HTMLDuetDatePickerElement;
    private revoFloat: HTMLElement;
    constructor(
        // column data
        private column: DateConfig,
        // to save changes
        private saveCallback: (value: any, preventFocus?: boolean) => void,
        // to close editor, if focusNext true, after close editor focus on next cell
        // private closeCallback: (focusNext?: boolean) => void
    ) {
    }

    element?: HTMLElement|null;
    editCell?: Edition.EditCell;
    componentDidRender() {
        if (!this.element || !this.revoFloat) {
            return;
        }
        const rect = this.element.getBoundingClientRect();
        this.revoFloat.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        this.revoFloat.style.width = `${rect.width}px`;
        this.revoFloat.style.height = `${rect.height}px`;
        document.body.append(this.revoFloat);
        this.calendar?.show();
    }
    disconnectedCallback() {
        this.calendar?.hide();
        this.revoFloat?.remove();
        this.calendar = null;
        this.revoFloat = null;
    }
    private onFloatClick(e: MouseEvent) {
        e.stopPropagation();
    }
    render(h: any) {
        let val = '';
        if (this.editCell) {
            const model = this.editCell.model || {};
            val = model[this.editCell?.prop] || '';
        }
        return <div class="revo-holder">
            <div class="revo-float" onClick={(e: MouseEvent) => this.onFloatClick(e)} ref={(e: HTMLElement) => this.revoFloat = e}>
                <duet-date-picker
                    {...this.column}
                    ref={(e: HTMLDuetDatePickerElement) => this.calendar = e}
                    value={val}
                    onDuetChange={({detail: {value, valueAsDate}}: DateChange) =>
                        this.saveCallback(this.column.valueAsDate ? valueAsDate : value)
                }/>
            </div>
        </div>;
    }
}
