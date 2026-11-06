# NetSuite Exercise: Interface

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

When account managers open a renewal, they want to see when it ends and what it's worth before anything else. Build a custom form for your Renewal record type with three field groups: Key Dates (end date, status), Value (contract value, risk level), and Customer.

Done when: a new Renewal record opens on your form with the three groups in that order.

## Scope Cap

One custom form with a few field groups. Script id `custform_<prefix>renewal`.

## Mock Data

None. This exercise needs no records beyond one test record named `<prefix>Test renewal`, which Claude creates and you can keep.

## What Chiron Checks

`check-exercise interface` prints `EXERCISE|interface|ok|custform_<prefix>renewal`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Changing the standard form: make your own.
- The form is not preferred: set it as the preferred form for your record type.
