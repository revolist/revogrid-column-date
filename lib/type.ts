import type { ColumnRegular, ColumnDataSchemaModel } from '@revolist/revogrid';

/**
 * Date parsing and display formatting contract forwarded to Duet Date Picker.
 * The stored picker value remains ISO-8601 even when the input is formatted
 * differently for users.
 */
export interface DateAdapter {
  parse(value: string, createDate: (year: string, month: string, day: string) => Date): Date | undefined;
  format(date: Date): string;
}

export interface DateConfig extends ColumnDataSchemaModel {
  column: ColumnRegular & {
    // if you wish to operate Date types
    valueAsDate?: boolean;
    appendTo?: 'body' | Element;
    /** Optional Duet adapter used to parse and format the date editor input. */
    dateAdapter?: DateAdapter;
    // and other options https://github.com/duetds/date-picker/blob/master/src/components/duet-date-picker/date-localization.ts
  };
}

export type DateChangeEvent = {
  valueAsDate: Date;
  value: string;
};
