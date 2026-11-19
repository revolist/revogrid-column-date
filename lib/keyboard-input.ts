import { isValidIsoDate } from '@revolist/ui/dates';
import type { DateAdapter } from './type';

/** Validate each civil date part before creating a local Date. */
export function createDate(year: string, month: string, day: string): Date {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(y, m - 1, d);
  return y >= 100 && y <= 9999 &&
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : new Date(NaN);
}

export function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]' &&
    !isNaN(Date.prototype.getTime.call(value));
}

export { formatIsoDate as utcDate } from '@revolist/ui/dates';

export function isoDate(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const isoAdapter: DateAdapter = {
  parse(value, make) {
    if (!isValidIsoDate(value)) return undefined;
    const [year, month, day] = value.split('-');
    const date = make(year, month, day);
    return !isNaN(date.getTime()) && isoDate(date) === value ? date : undefined;
  },
  format: isoDate,
};
export function parseIsoDate(value: string | undefined) {
  return value ? isoAdapter.parse(value, createDate) : undefined;
}

/** Keep entered separators and caret positions stable while accepting compact ISO digits. */
export function maskDateInput(input: HTMLInputElement): void {
  const text = input.value;
  if (!/^[\d-]*$/.test(text)) return;
  const digits = text.replace(/-/g, '');
  if (digits.length > 8) return;
  const caret = input.selectionStart ?? text.length;
  const before = text.slice(0, caret).replace(/-/g, '').length;
  const formatted =
    digits.slice(0, 4) +
    (digits.length > 4 ? '-' + digits.slice(4, 6) : '') +
    (digits.length > 6 ? '-' + digits.slice(6, 8) : '');
  if (formatted !== text) {
    input.value = formatted;
    const next = before + (before > 4 ? 1 : 0) + (before > 6 ? 1 : 0);
    input.setSelectionRange(next, next);
  }
}
