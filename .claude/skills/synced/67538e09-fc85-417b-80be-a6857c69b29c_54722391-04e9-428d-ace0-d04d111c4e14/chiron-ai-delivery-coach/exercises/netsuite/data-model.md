# NetSuite Exercise: Data Model

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

Account managers keep missing renewal dates, and revenue slips away. Build a Renewal custom record type, linked to the customer, with an end date, contract value, status and risk level.

Done when: the record type exists in your account with those fields, and a Renewal record can be linked to a customer.

## Scope Cap

One custom record type, four or five fields, one relationship (to Customer). Script id `customrecord_<prefix>renewal`, fields `custrecord_<prefix>...`, description "Created by Chiron for <email>".

## Mock Data

None. Do not create records yet.

## What Chiron Checks

`check-exercise data-model` prints `EXERCISE|data-model|ok|customrecord_<prefix>renewal`. Chiron also reads the record type's XML in your NetSuite project to confirm the fields and the relationship. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- NetSuite auto-number prefixes allow at most 8 characters, so record names cannot be auto-numbered with your tag: turn auto-numbering off and type names that start with your tag.
- NetSuite script ids are short: keep field ids brief.
- Status and risk level work best as custom lists, so saved searches can group by them.
- More than five fields: trim back to the cap.
