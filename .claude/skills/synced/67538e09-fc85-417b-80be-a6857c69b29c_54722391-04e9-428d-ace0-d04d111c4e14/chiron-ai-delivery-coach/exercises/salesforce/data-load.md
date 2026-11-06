# Salesforce Exercise: Data Load

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

The team wants to see a real-looking pipeline of renewals. Load 15 mock renewals from a CSV file, with end dates spread over the next 12 months and a mix of values and statuses.

Done when: your org shows your 15 renewals, and the count by status matches the file.

## Scope Cap

About 10 to 20 mock records into your own Renewal object, then a count check.

## Mock Data

A CSV file Claude writes in your practice project, `data/renewals.csv`, with these columns: Name (`<prefix>Renewal 01` to `<prefix>Renewal 15`), Account, End Date, Contract Value, Status (Not Started, In Progress, Renewed, Lost), Risk Level (Low, Medium, High). Use made-up account names such as Northwind Traders, or accounts that already exist in your practice org. Never real customer, people or company names.

## What Chiron Checks

`check-exercise data-load` prints `EXERCISE|data-load|ok|<n> records` with 10 or more, counting only names that start with your prefix. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Names without the prefix are not counted: fix the file and load again.
- Loading twice doubles the records: ask Claude to update by name instead of inserting again.
- Account names must match accounts in the org: let Claude look them up first.
