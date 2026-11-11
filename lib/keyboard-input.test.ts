import { expect, it } from 'vitest';
import {
  createDate,
  isoAdapter,
  isoDate,
  maskDateInput,
} from './keyboard-input';
it('rejects impossible and incomplete civil dates including leap years', () => {
  for (const text of [
    '2026-02-29',
    '2026-02-30',
    '2026-13-01',
    '2026-11-',
    '20261111',
  ])
    expect(isoAdapter.parse(text, createDate)).toBeUndefined();
  for (const text of ['2024-02-29', '2026-11-11', '0099-01-01'])
    expect(isoDate(isoAdapter.parse(text, createDate)!)).toBe(text);
});
it('inserts separators for compact typing/paste and keeps the caret with its digits', () => {
  const input = document.createElement('input');
  input.value = '20261111';
  input.setSelectionRange(8, 8);
  maskDateInput(input);
  expect(input.value).toBe('2026-11-11');
  expect(input.selectionStart).toBe(10);
  input.value = '202611';
  input.setSelectionRange(6, 6);
  maskDateInput(input);
  expect(input.value).toBe('2026-11');
  expect(input.selectionStart).toBe(7);
  input.value = '2026-11-11';
  input.setSelectionRange(5, 5);
  maskDateInput(input);
  expect(input.selectionStart).toBe(5);
  input.value = '';
  maskDateInput(input);
  expect(input.value).toBe('');
});
