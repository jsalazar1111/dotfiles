# Salesforce Exercise: Reporting

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

The sales leader wants to see which renewals are coming up and what they are worth. Build one report of renewals ending this quarter, grouped by status with total value, and a dashboard with two or three components: value due by month, renewals by status, and a list of high-risk renewals.

Done when: both are in your own folder and show the renewals you loaded.

## Scope Cap

One report and a dashboard of two or three components, plus the supporting reports the dashboard needs (each chart reads from one report, with one set of filters). Reports go in a report folder and the dashboard in a dashboard folder, both named `<prefix without the last _>`.

## Mock Data

None. It uses the renewals from the data load exercise.

## What Chiron Checks

`check-exercise reporting` prints `EXERCISE|reporting|ok|<n> report|<n> dashboard`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Saving into a shared folder: everything goes in your own folder.
- The dashboard shows nothing: check its running user can see your records.
