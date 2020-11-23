import { RevoGrid } from '@revolist/revogrid/dist/types/interfaces';
export interface DateConfig extends RevoGrid.ColumnRegular {
    // if you wish to operate Date types
    valueAsDate?: boolean;
}

export type DateChangeEvent = {
    valueAsDate: Date;
    value: string;
};
