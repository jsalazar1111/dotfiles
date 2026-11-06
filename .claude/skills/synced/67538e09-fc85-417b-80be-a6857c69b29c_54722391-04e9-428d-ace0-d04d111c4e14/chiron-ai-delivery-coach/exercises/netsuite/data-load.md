# NetSuite Exercise: Data Load

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

The team wants to see a real-looking pipeline of renewals. Load 15 mock renewals with the CSV Import Assistant, with end dates spread over the next 12 months and a mix of values and statuses.

Done when: the import results page shows 15 records added with no errors.

## Scope Cap

About 10 to 20 mock records into your own Renewal record type, then a count check.

## Mock Data

A CSV file Claude writes in your practice project, `data/renewals.csv`, with these columns: Name (`<prefix>Renewal 01` to `<prefix>Renewal 15`), Customer, End Date, Contract Value, Status, Risk Level. Use made-up customer names such as Northwind Traders, or customers that already exist in your practice org. Never real customer, people or company names.

## What Chiron Checks

`check-exercise data-load` prints `EXERCISE|data-load|browser|csv-import`: the SuiteCloud tools cannot count records, so Chiron reads the import results page (Setup, Import/Export, View CSV Import Status) with `browser-use` and counts the records added. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Fields not mapped in the assistant come in empty: map every column.
- Running the import twice doubles the records: use Update for a second run.
