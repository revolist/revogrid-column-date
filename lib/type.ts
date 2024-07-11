import type { ColumnRegular } from '@revolist/revogrid';
export interface DateConfig extends ColumnRegular {
    // if you wish to operate Date types
    valueAsDate?: boolean;
    appendTo?: 'body' | Element;
}

export type DateChangeEvent = {
    valueAsDate: Date;
    value: string;
};
