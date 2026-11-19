import type { DateAdapter } from './type';

/** Use civil dates Duet can round-trip without JavaScript's legacy year offset. */
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

export function utcDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isoDate(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const isoAdapter: DateAdapter = {
  parse(value, make) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;
    const date = make(match[1], match[2], match[3]);
    return !isNaN(date.getTime()) && isoDate(date) === value ? date : undefined;
  },
  format: isoDate,
};
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
