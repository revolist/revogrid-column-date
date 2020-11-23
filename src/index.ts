import { ColumnRenderer } from './renderer';
import { ColumnEditor } from './editor';
import * as loader from "@duetds/date-picker/dist/loader";

export const Revogrid = window.Revogrid || {};

export default class ColumnType {
    constructor() {
        this.loadCustomComponent();
    }
    readonly editor = ColumnEditor;

    cellTemplate = ColumnRenderer;

    private loadCustomComponent() {
        if (loader?.defineCustomElements) {
            loader?.defineCustomElements();
        }
    }
}
Revogrid.DateColumnType = ColumnType;
