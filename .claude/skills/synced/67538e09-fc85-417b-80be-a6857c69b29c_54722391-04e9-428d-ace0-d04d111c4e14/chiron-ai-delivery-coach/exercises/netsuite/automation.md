# NetSuite Exercise: Automation

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

Renewals slip when nobody starts the conversation in time. Build a workflow on your Renewal record type: when a renewal's end date is within the next 60 days and it is not yet renewed, set its status to Due Soon and send an email to the owner.

Done when: the workflow is released, and saving a test renewal that ends next month sets Due Soon.

## Scope Cap

One simple workflow of two or three states or actions. Script id `customworkflow_<prefix>renewal_reminder`.

## Mock Data

None. This exercise needs no records beyond one test record named `<prefix>Test renewal`, which Claude creates and you can keep.

## What Chiron Checks

`check-exercise automation` prints `EXERCISE|automation|ok|customworkflow_<prefix>renewal_reminder`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- The workflow is in Testing: set its release status to Released.
- It triggers on every save: add conditions on the end date and status.
- Renewed or lost renewals still get emails: exclude them in the condition.
