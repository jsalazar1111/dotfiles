# NetSuite Exercise: Reporting

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

The sales leader wants to see which renewals are coming up and what they are worth. Build one saved search of renewals ending this quarter, grouped by status with total value, and a SuiteAnalytics workbook with one chart of renewal value by month.

Done when: the saved search runs, the workbook's chart shows the renewals you loaded, and both are yours.

## Scope Cap

One saved search, plus one workbook (with its dataset) showing a single chart. Script ids that start with `customsearch_<prefix>`, `custdataset_<prefix>` and `custworkbook_<prefix>` (for example `customsearch_<prefix>renewals_due`).

## Mock Data

None. It uses the renewals from the data load exercise.

## What Chiron Checks

`check-exercise reporting` prints `EXERCISE|reporting|ok|customsearch_<prefix>renewals_due|custworkbook_<prefix>renewals`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- The SuiteCloud tools cannot create a saved search or a workbook from scratch, only import one that exists: build both in NetSuite with `browser-use` (named with your tag), then import them into the project so they are on GitHub.
- NetSuite's UI picks dataset and workbook ids itself (such as `custworkbook8`), without your tag. Import them, give the imported copies ids that start with `custdataset_<prefix>` and `custworkbook_<prefix>`, and deploy those; leave the original that NetSuite created in the UI in place for the cleanup after your demo.
- Workbook definitions are harder for Claude to write than saved searches: if the deploy keeps failing, build the workbook in NetSuite with `browser-use` instead, then bring it into the project.
- The workbook has more than one view: keep it to one chart.
- The search is public to everyone: keep it to yourself.
- No results: check the criteria match your records' status values.
