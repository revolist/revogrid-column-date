import './style.css';
import { defineCustomElements } from '@revolist/revogrid/loader';
import Plugin from '@revolist/revogrid-column-date';
import { makeData } from './makeData';

defineCustomElements();

const app = document.querySelector('#app');
const grid = document.createElement('revo-grid');

const COLUMN_TYPE_DATE = 'date';
grid.theme = 'compact';
// define columns
grid.columns = [
  { name: 'Last Name', prop: 'lastName', size: 200 },
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
