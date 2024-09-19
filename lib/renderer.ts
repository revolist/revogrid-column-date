import {
  type ColumnDataSchemaModel,
  type HyperFunc,
  type VNode,
} from '@revolist/revogrid';

const svg = `<svg aria-hidden="true" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
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

export const ColumnRenderer = (
  h: HyperFunc<VNode>,
  { value }: ColumnDataSchemaModel,
) => {
  return [
    h('div', { class: { 'cell-value-wrapper': true } }, value?.toString()),
    h('button', {
      class: { calendar: true },
      innerHTML: svg,
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
