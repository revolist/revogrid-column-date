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

## Keyboard-first date entry

Keep the calendar closed when editing starts and select the existing input value:

```ts
const columns = [{
  prop: 'date',
  columnType: 'date',
  openCalendarOnEdit: false,
  selectOnFocus: true,
  inputMask: 'YYYY-MM-DD',
}];
```

Typing or pasting `20261111` inserts `2026-11-11`. Enter saves and moves down;
Tab saves and moves right, Shift+Tab moves left, and Escape cancels. Typing is
staged until commit. The existing calendar button remains available.

`openCalendarOnEdit` defaults to `true`, preserving calendar-first editing.
`selectOnFocus` defaults to `true` in keyboard-first mode; set it to `false` to
keep the caret without selecting. `inputMask` is optional in keyboard-first mode and uses ISO input
formatting; omit it when supplying a custom Duet `dateAdapter`.

Keyboard commits validate complete real dates, `required`, `min`, `max` and
`isDateDisabled`. Invalid drafts stay editable. Translate their validation text
with `invalidDateMessage` (default: `Enter a valid date.`). Existing Duet
`localization` continues to control calendar labels. `valueAsDate: true` saves a
`Date` object; clearing an optional value saves `null` in that mode, or `''`
otherwise.

Run `pnpm test` for unit tests and `pnpm test:browser` for browser regressions
(after `pnpm exec playwright install chromium` on a new machine).
