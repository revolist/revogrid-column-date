import './style.css';
import { defineCustomElements } from '@revolist/revogrid/loader';
import Plugin from '@revolist/revogrid-column-date';

defineCustomElements();

const app = document.querySelector('#app');
const grid = document.createElement('revo-grid');

const COLUMN_TYPE_DATE = 'date';

// define columns
grid.columns = [
  { name: 'A', prop: 'name', size: 250 },
  {
    name: 'B',
    prop: 'date',
    size: 150,
    // provide column type format
    columnType: COLUMN_TYPE_DATE,
  },
];
grid.source = [
  {
    name: 'Mark',
    date: '2020-08-24',
  },
  {
    name: 'Kate',
    date: '2020-08-24',
  },
];

// define formats
grid.columnTypes = {
  [COLUMN_TYPE_DATE]: new Plugin(),
};
app?.appendChild(grid);
