import type { ColumnRegular, ColumnDataSchemaModel } from '@revolist/revogrid';

/**
 * Date parsing and display formatting for the editor input.
 * The picker uses ISO-8601 dates even when the input is formatted
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
    /** Defaults to true. False enables staged, keyboard-first date entry. */
    openCalendarOnEdit?: boolean;
    /** Select the existing value on entry; defaults to true in keyboard-first mode. */
    selectOnFocus?: boolean;
    /** Insert ISO separators during keyboard-first typing. Use without a custom dateAdapter. */
    inputMask?: 'YYYY-MM-DD';
    appendTo?: 'body' | Element;
    /** Optional adapter used to parse and format the date editor input. */
    dateAdapter?: DateAdapter;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    isDateDisabled?: (date: Date) => boolean;
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    direction?: 'left' | 'right';
    identifier?: string;
    name?: string;
    role?: string;
    localization?: DateLocalization;
  };
}

/** Labels supported by the date column. */
export interface DateLocalization {
  locale?: string;
  buttonLabel?: string;
  placeholder?: string;
  selectedDateMessage?: string;
  prevMonthLabel?: string;
  nextMonthLabel?: string;
  monthSelectLabel?: string;
  yearSelectLabel?: string;
  closeLabel?: string;
  calendarHeading?: string;
  dayNames?: readonly string[];
  monthNames?: readonly string[];
  monthNamesShort?: readonly string[];
}
