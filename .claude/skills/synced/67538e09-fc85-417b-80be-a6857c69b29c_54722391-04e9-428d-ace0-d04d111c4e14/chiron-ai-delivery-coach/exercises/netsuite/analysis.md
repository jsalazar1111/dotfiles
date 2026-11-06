# NetSuite Exercise: Analysis

`<prefix>` is the learner's saved prefix (for example `ai_mkhan_`), and `<email>` their Plative email.

## Brief

A new consultant joins a project and needs to understand an automation someone built before them. Pick one existing workflow or SuiteScript in the account, import it to your NetSuite project, and have Claude write a one-page solution document: what starts it, what it does step by step, what it touches, and the risks of changing it. Nothing in the account changes.

Done when: the document is in your practice project on GitHub, linked on your story, and matches the script or workflow.

## Scope Cap

One workflow or script, explained in a one-page solution document. Read-only: nothing is deployed and nothing gets your prefix.

## Mock Data

None. It reads existing objects only.

## What Chiron Checks

`check-exercise analysis` prints `EXERCISE|analysis|ok|read-only`. Chiron then reads the document and the imported files from your practice project on GitHub and checks the document explains that component. The `<prefix>` rule does not apply here. The exercise's Jira story must also be Done, with the plan as a comment and a comment linking the evidence on GitHub.

## Common Pitfalls

- Keep the retrieved copy in `analysis/retrieved/`, outside the folder that gets deployed, so a later deploy never sends it back to the org.
- The org has no workflows or scripts of its own: explain the Renewal Reminder workflow you built in the Automation exercise instead.
- Picking something huge: choose one workflow or script you can explain on one page.
- Asking Claude to fix what it finds: this exercise only explains.
- A good place to try a subagent: ask Claude to send a helper to read the files and report back.
