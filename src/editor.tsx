import '@duetds/date-picker/dist/duet/themes/default.css';
import {Edition} from '@revolist/revogrid/dist/types/interfaces';
import { DateChangeEvent, DateConfig } from './type';


export class ColumnEditor implements Edition.EditorBase {
    private calendar: HTMLDuetDatePickerElement;
    constructor(
        // column data
        private column: DateConfig,
        // to save changes
        private saveCallback: (value: any, preventFocus?: boolean) => void,
        // to close editor, if focusNext true, after close editor focus on next cell
        // private closeCallback: (focusNext?: boolean) => void
    ) {
    }

    element?: HTMLSelectElement|null;
    editCell?: Edition.EditCell;
    componentDidRender() {
        this.calendar?.show();
    }
    render(h: any) {
        let val = '';
        if (this.editCell) {
            const model = this.editCell.model || {};
            val = model[this.editCell?.prop] || '';
        }
        return <duet-date-picker
            {...this.column}
            ref={(e: HTMLDuetDatePickerElement) => this.calendar = e}
            value={val}
            onDuetChange={({detail: {value, valueAsDate}}: CustomEvent<DateChangeEvent>) => {
                this.saveCallback(this.column.valueAsDate ? valueAsDate : value);
            }
        }/>;
    }
}
