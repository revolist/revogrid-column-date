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

// Ensure it's available on window for UMD/IIFE builds
if (typeof window !== 'undefined') {
  (window as any).RevoColumnType = ColumnType;
}

