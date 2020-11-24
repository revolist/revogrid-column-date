export const ColumnRenderer = (h: any, {model, prop }: any): any[] => {
    let val = model[prop];
    return [
        <div class='cell-value-wrapper'>{val}</div>,
        <span class={{ 'calendar': true }}
            onClick = {(e: MouseEvent) => {
                const ev = new MouseEvent('dblclick', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                e.target.dispatchEvent(ev);
            }}>
        </span>
    ];
};
