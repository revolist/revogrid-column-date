import './calendar-theme.scss';
import '@revolist/ui/styles/calendar.css';
import { CalendarPicker } from '@revolist/ui/calendar/index';
import { renderPreactInto } from '@revolist/ui/preact-mount';
import { h } from 'preact';
import { isoDate, parseIsoDate } from './keyboard-input';
import type { DateConfig } from './type';

export const calendarIcon = `<svg aria-hidden="true" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd" transform="translate(2 2)">
        <path d="m2.5.5h12c1.1045695 0 2 .8954305 2 2v12c0 1.1045695-.8954305 2-2 2h-12c-1.1045695 0-2-.8954305-2-2v-12c0-1.1045695.8954305-2 2-2z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="m.5 4.5h16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        <g fill="currentColor">
            <circle cx="8.5" cy="8.5" r="1"></circle>
            <circle cx="4.5" cy="8.5" r="1"></circle>
            <circle cx="12.5" cy="8.5" r="1"></circle>
            <circle cx="8.5" cy="12.5" r="1"></circle>
            <circle cx="4.5" cy="12.5" r="1"></circle>
            <circle cx="12.5" cy="12.5" r="1"></circle>
        </g>
    </g>
</svg>
`;

type PickerDate = NonNullable<Parameters<typeof CalendarPicker>[0]['defaultMonth']>;

function pickerDate(value?: string): PickerDate | undefined {
  return parseIsoDate(value) ? value as PickerDate : undefined;
}

export function mountCalendar(
  host: HTMLElement,
  column: DateConfig['column'],
  date: string | undefined,
  onSelect: (date: string) => void,
) {
  const text = column.localization ?? {};
  const min = pickerDate(column.min);
  const max = pickerDate(column.max);
  const selected = pickerDate(date);
  const initial = selected ?? pickerDate(isoDate(new Date()));
  const defaultMonth = min && initial < min ? min : max && initial > max ? max : initial;
  const months = text.monthNames ?? text.monthNamesShort;
  const translations = {
    ...(text.calendarHeading && { calendar: text.calendarHeading }),
    ...(text.prevMonthLabel && { previousMonth: text.prevMonthLabel }),
    ...(text.nextMonthLabel && { nextMonth: text.nextMonthLabel }),
    ...(text.monthSelectLabel && { chooseMonth: text.monthSelectLabel }),
    ...(text.yearSelectLabel && { chooseYear: text.yearSelectLabel }),
  };

  renderPreactInto(host, h(CalendarPicker, {
    mode: 'single',
    required: true,
    selected,
    defaultMonth,
    minDate: min,
    maxDate: max,
    weekStartsOn: column.firstDayOfWeek,
    locale: text.locale ?? 'en-GB',
    translations,
    captionLayout: 'dropdown',
    formatMonth: months
      ? (value) => {
          const month = parseIsoDate(value);
          return month ? months[month.getMonth()] + ' ' + month.getFullYear() : value;
        }
      : undefined,
    formatWeekday: text.dayNames
      ? (value) => text.dayNames[parseIsoDate(value).getDay()]
      : undefined,
    isDateDisabled: (value) => {
      const candidate = parseIsoDate(value);
      return !candidate || column.isDateDisabled?.(candidate) === true;
    },
    onSelectionChange: (value: string | undefined) => {
      if (value) onSelect(value);
    },
  }));
}

export function unmountCalendar(host: HTMLElement) {
  renderPreactInto(host, null);
}
