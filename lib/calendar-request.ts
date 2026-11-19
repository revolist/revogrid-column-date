import type { DateConfig } from './type';

type Cell = Pick<DateConfig, 'model' | 'prop'>;
const requests = new WeakMap<Element, Cell>();

function clearRequest(event: Event) {
  requests.delete(event.currentTarget as Element);
}

export function startCalendarEdit(grid: Element, cell: Cell, startEdit: () => void) {
  grid.removeEventListener('beforeeditstart', clearRequest, true);
  requests.set(grid, cell);
  startEdit();
  // If this edit was canceled, a subsequent edit must open normally.
  grid.addEventListener('beforeeditstart', clearRequest, { capture: true, once: true });
}

export function takeCalendarRequest(editor: Element | null | undefined, cell: Cell) {
  const grid = editor?.closest('revo-grid');
  if (!grid) return false;
  const request = requests.get(grid);
  if (!request || request.model !== cell.model || request.prop !== cell.prop) {
    return false;
  }
  requests.delete(grid);
  return true;
}
