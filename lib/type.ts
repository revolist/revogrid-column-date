import type { ColumnRegular, ColumnDataSchemaModel } from '@revolist/revogrid';
export interface DateConfig extends ColumnDataSchemaModel {
  column: ColumnRegular & {
    // if you wish to operate Date types
    valueAsDate?: boolean;
    appendTo?: 'body' | Element;
    // and other options https://github.com/duetds/date-picker/blob/master/src/components/duet-date-picker/date-localization.ts
  };
}

export type DateChangeEvent = {
  valueAsDate: Date;
  value: string;
};
