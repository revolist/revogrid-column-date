import { ColumnRenderer } from './renderer';
import { ColumnEditor } from './editor';
import { defineCustomElements } from '@duetds/date-picker/custom-element';

export * from './editor';
export * from './renderer';

export default class ColumnType {
  constructor() {
    defineCustomElements?.();
  }
  readonly editor = ColumnEditor;
  cellTemplate = ColumnRenderer;
}

