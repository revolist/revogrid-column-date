import { ColumnRenderer } from './renderer';
import { ColumnEditor } from './editor';
import { defineCustomElements } from '@duetds/date-picker/dist/loader';

defineCustomElements?.();

export const Revogrid = window.Revogrid || {};

export default class ColumnType {
  readonly editor = ColumnEditor;
  cellTemplate = ColumnRenderer;
}
Revogrid.DateColumnType = ColumnType;
