// import { DateConfig } from "./type";
const style = {
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: '5px 4px 0 4px',
    borderColor: 'transparent',
    borderTopColor: 'initial',
    display: 'inline-block',
    verticalAlign: 'middle',
    opacity: '.4'
  };
export const ColumnRenderer = (h: any, {model, prop }: any): any[] => {
    // let col = column as DateConfig;
    let val = model[prop];
    return [
        <div class='cell-value-wrapper'>{val}</div>,
        <span class={{ 'arrow-down': true }}
            onClick = {(e: MouseEvent) => {
                const ev = new MouseEvent('dblclick', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                e.target.dispatchEvent(ev);
            }}>
            <span {...{ style }}/>
        </span>
    ];
};
