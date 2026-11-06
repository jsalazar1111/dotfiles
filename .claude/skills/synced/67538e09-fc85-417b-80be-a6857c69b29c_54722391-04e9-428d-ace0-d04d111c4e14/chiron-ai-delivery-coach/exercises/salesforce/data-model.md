# Salesforce Exercise: Data Model

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

Account managers keep missing renewal dates, and revenue slips away. Build a Renewal object, linked to the account, with an end date, contract value, status and risk level.

Done when: the object exists in your org with those fields, and a Renewal record can be linked to an account.

## Scope Cap

One custom object, four or five fields, one relationship (to Account). Name it `<prefix>Renewal__c`, label `[<prefix without the last _>] Renewal`, description "Created by Chiron for <email>". The record name is a text field, not an auto-number, so mock records can carry your tag in their names.

## Mock Data

None. Do not create records yet.

## What Chiron Checks

`check-exercise data-model` prints `EXERCISE|data-model|ok|<prefix>Renewal__c|<n> fields|<n> relationship`. Before the deploy, `check-conflict <prefix>Renewal__c` prints `CONFLICT|none`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- A Renewals list on the Account page means changing the shared Account page layout: leave it out. The Renewal's own page shows its account.
- Claude drops the prefix: ask it to rename before deploying.
- Status and risk level work best as picklists, so reports can group by them.
- More than five fields: trim back to the cap.
