import { defineCustomElements } from '@revolist/revogrid/loader';
import DateColumn from '../lib';
void defineCustomElements();
const grid = document.querySelector('revo-grid')!;
const params = new URLSearchParams(location.search);
grid.columnTypes = { date: new DateColumn() };
grid.columns = [
  {
    prop: 'date',
    size: 260,
    columnType: 'date',
    ...(params.has('calendar')
      ? {}
      : {
          openCalendarOnEdit: false,
          selectOnFocus: true,
          inputMask: 'YYYY-MM-DD',
          invalidDateMessage: 'Datum prüfen',
          min: '2026-11-01',
          max: '2026-11-30',
          isDateDisabled: (d: Date) => d.getDate() === 13,
        }),
    ...(params.has('custom') ? { inputMask: undefined, dateAdapter: {
      parse: (text: string, create: (y: string, m: string, d: string) => Date) => {
        const parts = text.split('.');
        return parts.length === 3 ? create(parts[2], parts[1], parts[0]) : undefined;
      },
      format: (date: Date) => `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`,
    } } : {}),
    ...(params.has('asDate') ? { valueAsDate: true } : {}),
  },
  { prop: 'next', size: 160 },
];
grid.source = [
  {
    date: params.has('asDate')
      ? new Date('2026-11-11T00:00:00Z')
      : '2026-11-11',
    next: 'next',
  },
  { date: '2026-11-12', next: 'row2' },
];
