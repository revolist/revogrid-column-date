import type { HyperFunc, VNode } from '@revolist/revogrid';
import { calendarIcon } from './calendar';
import { startCalendarEdit } from './calendar-request';
import { isDate, utcDate } from './keyboard-input';
import type { DateConfig } from './type';

export const ColumnRenderer = (
  h: HyperFunc<VNode>,
  { value, column, model, prop }: DateConfig,
) => {
  const display = column.openCalendarOnEdit === false && isDate(value)
    ? utcDate(value)
    : value?.toString();
  return [
    h('div', { class: { 'cell-value-wrapper': true } }, display),
    h('button', {
      class: { calendar: true },
      innerHTML: calendarIcon,
      onClick: (e: MouseEvent) => {
        const ev = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        const target = e.target as Element;
        const grid = target.closest('revo-grid');
        if (grid && column.openCalendarOnEdit === false) {
          startCalendarEdit(grid, { model, prop }, () => target.dispatchEvent(ev));
        } else {
          target.dispatchEvent(ev);
        }
      },
    }),
  ];
};
