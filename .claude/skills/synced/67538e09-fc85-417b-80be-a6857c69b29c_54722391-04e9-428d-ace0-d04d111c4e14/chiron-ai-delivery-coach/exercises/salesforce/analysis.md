# Salesforce Exercise: Analysis

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

A new consultant joins a project and needs to understand an automation someone built before them. Pick one existing flow or Apex class in the org, retrieve it to your practice project, and have Claude write a one-page solution document: what starts it, what it does step by step, what it touches, and the risks of changing it. Nothing in the org changes.

Done when: the document is in your practice project on GitHub, linked on your story, and matches the metadata.

## Scope Cap

One flow or Apex class, explained in a one-page solution document. Read-only: nothing is deployed and nothing gets your prefix.

## Mock Data

None. It reads existing metadata only.

## What Chiron Checks

`check-exercise analysis` prints `EXERCISE|analysis|ok|read-only`. Chiron then reads the document and the retrieved metadata from your practice project on GitHub and checks the document explains that component. Your name for the document can be anything; the `<prefix>` rule does not apply here. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Keep the retrieved copy in `analysis/retrieved/`, outside the folder that gets deployed, so a later deploy never sends it back to the org.
- The org has no flows or Apex classes of its own: explain the Renewal Reminder flow you built in the Automation exercise instead.
- Picking something huge: choose one flow or class you can explain on one page.
- Asking Claude to fix what it finds: this exercise only explains.
- A good place to try a subagent: ask Claude to send a helper to read the metadata and report back.
