# Salesforce Exercise: Automation

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

Renewals slip when nobody starts the conversation in time. Build a record-triggered flow on your Renewal object: when a renewal's end date is within the next 60 days and it is not yet renewed, set its status to Due Soon and create a task for the owner.

Done when: the flow is active, and saving a test renewal that ends next month sets Due Soon and creates the task.

## Scope Cap

One simple flow of two or three steps, on your own object. Name it `<prefix>Renewal_Reminder`.

## Mock Data

None. This exercise needs no records beyond one test record named `<prefix>Test renewal`, which Claude creates and you can keep.

## What Chiron Checks

`check-exercise automation` prints `EXERCISE|automation|ok|<prefix>Renewal_Reminder`. Before the deploy, `check-conflict <prefix>Renewal_Reminder` prints `CONFLICT|none`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- The flow is saved but not active: activate it.
- It creates a task on every save: run it only when the record first meets the condition.
- Renewed or lost renewals still get tasks: exclude them in the condition.
