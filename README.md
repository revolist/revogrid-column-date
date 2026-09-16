# `revogrid-column-date`
Custom column type for [RevoGrid](https://github.com/revolist/revogrid) component based on [duetds-date-picker](https://github.com/duetds/date-picker) library.


## Installation
`npm i @revolist/revogrid-column-date`

## How to use

- Import Select Column type;
- Specify table data;
- Per column specify column type;
- Register your column type;
```js

// do import
import Plugin from "@revolist/revogrid-column-date";

const columns = [{ prop: 'name', columnType: 'date' }];
const rows = [{ name: '2020-08-24' }, { name: '2022-08-24' }];

// register column type
const columnTypes = { 'date': new Plugin() };

// apply data to grid per your framework approach
<revo-grid source={rows} columns={columns} columnTypes={columnTypes}/>
```
