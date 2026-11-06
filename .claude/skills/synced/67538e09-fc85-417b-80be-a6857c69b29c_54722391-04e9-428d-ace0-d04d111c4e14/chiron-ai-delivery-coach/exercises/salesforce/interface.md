# Salesforce Exercise: Interface

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

When account managers open a renewal, they want to see when it ends and what it's worth before anything else. Build a page layout for your Renewal object with three sections: Key Dates (end date, status), Value (contract value, risk level), and Account.

Done when: a new Renewal record shows the three sections in that order.

## Scope Cap

One page layout with a few sections, on your own Renewal object. Name it `<prefix>Renewal Layout`.

## Mock Data

None. This exercise needs no records beyond one test record named `<prefix>Test renewal`, which Claude creates and you can keep.

## What Chiron Checks

`check-exercise interface` prints `EXERCISE|interface|ok|<prefix>Renewal Layout`. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Editing the object's default layout instead of making your own: make a new one with your prefix.
- Forgetting to assign the layout to your profile: the record still shows the old one.
