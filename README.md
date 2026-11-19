# `revogrid-column-date`
Custom column type for [RevoGrid](https://github.com/revolist/revogrid) with the shared [Revo UI](https://rv-grid.com/) calendar.


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
staged until commit. The existing calendar button remains available. Alt+Down also opens the calendar from the
input. Dismissing the calendar restores focus to the input and keeps the draft.

`openCalendarOnEdit` defaults to `true`, preserving calendar-first editing.
`selectOnFocus` defaults to `true` in keyboard-first mode; set it to `false` to
keep the caret without selecting. `inputMask` is optional in keyboard-first mode and uses ISO input
formatting; omit it when supplying a custom `dateAdapter`.

Keyboard commits validate complete dates in years 0100 through 9999 and respect
`required`, `min`, `max`, and `isDateDisabled`. Invalid drafts stay editable.
In keyboard-first mode, the cell and editor display the same UTC calendar day
for `Date` values. With `valueAsDate: true`, changing the date saves UTC midnight
and keeping the same day preserves its timestamp. Clearing an optional value
saves `null` in that mode, or `''` otherwise.

Run `pnpm test` for unit tests and `pnpm test:browser` for browser regressions
(after `pnpm exec playwright install chromium` on a new machine).

Existing column definitions can keep their `dateAdapter`, `appendTo`, and
`valueAsDate` options. Calendar-first commits still produce local `Date`
objects when `valueAsDate` is enabled, and the named form field contains the
ISO date. Calendar captions use the configured locale. The picker can be
dismissed with Escape or a click outside.
