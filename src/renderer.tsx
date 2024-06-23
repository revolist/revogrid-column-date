import { h } from '@stencil/core';
import { ColumnDataSchemaModel, HyperFunc, VNode } from '@revolist/revogrid';

export const ColumnRenderer = (
  _: HyperFunc<VNode>,
  { model, prop }: ColumnDataSchemaModel,
): VNode[] => {
  let val = model[prop];
  return [
    <div class="cell-value-wrapper">{val}</div>,
    <span
      class={{ calendar: true }}
      onClick={(e: MouseEvent) => {
        const ev = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        e.target.dispatchEvent(ev);
      }}
    />,
  ];
};
