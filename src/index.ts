import './style.css';
import { defineCustomElements } from '@revolist/revogrid/loader';
import Plugin from '@revolist/revogrid-column-date';
import { makeData } from './makeData';

defineCustomElements();

const app = document.querySelector('#app');
const grid = document.createElement('revo-grid');

const COLUMN_TYPE_DATE = 'date';

// define columns
grid.columns = [
  { prop: 'lastName', size: 100 },
  {
    name: 'Birthday',
    prop: 'birthday',
    size: 150,
    valueAsDate: true,
    // provide column type format
    columnType: COLUMN_TYPE_DATE,
  },
];
grid.source = makeData(120);
// define formats
grid.columnTypes = {
  [COLUMN_TYPE_DATE]: new Plugin(),
};
app?.appendChild(grid);
