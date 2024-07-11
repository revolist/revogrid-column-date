import type {
  ColumnDataSchemaModel,
  HyperFunc,
  VNode,
} from '@revolist/revogrid';

export const ColumnRenderer = (
  h: HyperFunc<VNode>,
  { model, prop }: ColumnDataSchemaModel,
): VNode[] => {
  let val = model[prop];
  return [
    h('div', { class: { 'cell-value-wrapper': true } }, [val]),
    h('span', {
      class: { calendar: true },
      onClick: (e: MouseEvent) => {
        const ev = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        e.target.dispatchEvent(ev);
      },
    }),
  ];
};
