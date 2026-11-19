import { ColumnRenderer } from './renderer';
import { ColumnEditor } from './editor';

export * from './editor';
export * from './renderer';
export type { DateConfig, DateAdapter, DateLocalization } from './type';

export default class ColumnType {
  readonly editor = ColumnEditor;
  cellTemplate = ColumnRenderer;
}

// Ensure it's available on window for UMD/IIFE builds
if (typeof window !== 'undefined') {
  (window as any).RevoColumnType = ColumnType;
}

