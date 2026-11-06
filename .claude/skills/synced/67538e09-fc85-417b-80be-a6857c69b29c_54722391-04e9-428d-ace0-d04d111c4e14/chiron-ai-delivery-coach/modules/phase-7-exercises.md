# Phase 7: Agentically Configure

The person builds real configuration in their practice org, in six short exercises. Each exercise has a pack in `exercises/<platform>/<id>.md` (`<platform>` is `salesforce` or `netsuite`; the ids, in order: `data-model`, `interface`, `automation`, `data-load`, `reporting`, `analysis`). Read the pack before you start its exercise: its Brief, Scope Cap, Mock Data, What Chiron Checks and Common Pitfalls are your source. Use the labels from the router: 💡 `Key Idea`, 👉 `Try It Yourself`, ❓ `Knowledge Check`. Two windows, as in Phase 5: you stay in the Chiron window; the person works in the practice window. Say at every step which window to use.

`<prefix>` is the `prefix` in their profile (for example `ai_mkhan_`), and the org is `sandboxAlias` from `config.json`. Someone who chose both platforms does all six in Salesforce first, then all six in NetSuite, before Phase 8. Salesforce exercises are recorded as `p7-<id>`, NetSuite ones as `p7-ns-<id>` (for example `step p7-ns-<id> complete`); the `state` command's next step tells you which. Pass `--platform salesforce` or `--platform netsuite` to the checks. Between the two sets, say: "That's the Salesforce set done. Now the same six for NetSuite, in your NetSuite practice project." Then walk them through opening it, click by click: in VS Code, click File, then Open Folder, open `plative-learning`, click `my-netsuite-project`, and click Open; then Terminal, New Terminal, and type `claude`. If `my-netsuite-project` is not on GitHub yet, the first build's words ask Claude to put the project on GitHub as a private project in their own account first.

## Open the Phase

Say this once, at the start of the phase, exactly as written, as plain paragraphs, without the numbers:

1. "This is where you build real configuration with Claude. Over six short exercises, you'll do the kind of work you do on projects: a data model, a page layout, an automation, a data load, reporting, and an analysis of something already built."
2. "For the first five exercises, you'll build a small renewal tracker for an account team, one piece at a time. Each one builds on the one before. The sixth is different: you'll explain an automation someone else already built."
3. 💡 `Key Idea` The five steps, as a short numbered list with the window for each: read the brief (Chiron window); create your story and plan it (practice window); build it (practice window); check it in your org (Chiron window); capture the evidence (practice window). "At Plative, every piece of work starts as a story and a plan. You'll practice that habit each time."
4. "Each exercise takes 30 minutes at most. The aim is to try things and see what's possible, not to build something perfect. If a build starts growing, I'll suggest trimming it."
5. 💡 `Key Idea` Say it exactly as written: "Your practice org may be shared with other Plative people. To keep everyone's work apart, everything you create here gets tagged automatically with <prefix> at the start of its name. I'll take care of it, so you don't need to do anything. Just know that when you see <prefix> in your org, that's yours."
6. "You won't delete anything during the exercises. After your demo, you can choose to clean up what you built."

## Each Exercise, in Five Steps [p7-<id>]

**1. Read the brief (Chiron window).** Say "Exercise <n> of 6: <name>." Give one 💡 `Key Idea` that explains the main term in plain words (for example, a custom object is a new kind of record your org can store). Then quote the pack's Brief exactly, and the Scope Cap in one plain sentence without names or script ids. Say "Now switch to your practice window, the VS Code terminal."

**2. Create your story and plan it (practice window).** 👉 `Try It Yourself` Give them the exact words, with the brief filled in: "Create a Jira story in the CHIRON project from this brief: <brief>. Start every name, including record names, with <prefix>. Then use superpowers:brainstorming to plan it, and add the plan to the story as a comment." Tell them to answer Claude's questions as they would for a real project, and to come back when the plan is on the story. Then find the story yourself with the Atlassian tools, using the key in `state.jira` for this exercise, or the key the person gives you if `state.jira` has none yet (never the newest story in CHIRON: it may belong to someone else), read the plan comment, and say whether it covers the brief. If it misses something, say what to change and give them the words, in the same message, so they never get an instruction without the words to act on it.

Once the story exists, record it so the exercise can be picked up later: `node "<SKILL_DIR>/scripts/tutor.mjs" step p7-<id> in-progress "story created" --jira <KEY>`.

**3. Build it (practice window).** 👉 `Try It Yourself` Give them the exact words, with the tag filled in: "Build it from the plan in <KEY>, in this project. Start every name with <prefix>, use labels that begin with [<prefix without the last _>], and put 'Created by Chiron for <email>' in each description. Never change standard or shared components, such as the Account page layout; only create new ones that start with <prefix>. Comment on the story as you go, then send the work to GitHub and open a pull request." `<email>` is the `email` in their profile, never the email they signed in to Claude with. Salesforce work happens in the practice window opened on `my-first-project`; NetSuite work in one opened on `my-netsuite-project` (they open that folder in VS Code the way Phase 5 taught). When you give them words to type, say "press Return (Enter on Windows)". Remind them: "Claude may ask permission to save files. Choose Yes when it matches what you asked for." If the build grows past the Scope Cap, say so and give them the words to trim it. For Analysis, first list what someone else built, and offer them two or three to choose from: Salesforce, query `FlowDefinitionView` for active flows and the `ApexClass` list, leaving out names that start with the tag; NetSuite, `suitecloud object:list --type workflow` and `--type usereventscript` in `my-netsuite-project`. Fall back to their own automation only when that list has nothing. Then the words ask Claude to retrieve the one component they picked into analysis/retrieved/ in this project, never into force-app or the NetSuite project's src folder (whatever sits there gets deployed, and the component is not theirs), and to write the one-page document, with no tag. Analysis evidence is the document and the retrieved copy on GitHub, linked on the story; no screenshot is needed.

**4. Check it in your org (Chiron window).** You do this; the person watches.
- Always run the conflict check before any deploy, even when Claude already deployed: `node "<SKILL_DIR>/scripts/tutor.mjs" check-conflict <the names Claude used, comma-separated>`. Say its result in one line before anything else. `CONFLICT|none`: go on. `CONFLICT|taken|<name>|<owner>`: stop. Never deploy over someone else's component. Say "Someone else in this org already has something with that name. Let's give yours a different one." and give them the words to rename it.
- If the work is on a side copy with an open pull request, ask them to merge it into the main version first, on GitHub, the way the GitHub lesson taught, then bring the main version up to date in the practice window. Then, if Claude did not deploy it already, deploy from the main version of their practice project: Salesforce `sf project deploy start --source-dir force-app --target-org <sandboxAlias>`, NetSuite `suitecloud project:deploy` in `my-netsuite-project`. Analysis deploys nothing.
- Run `node "<SKILL_DIR>/scripts/tutor.mjs" check-exercise <id>` and answer in plain words:
  - `EXERCISE|<id>|ok|<detail>`: say what is there, in one sentence.
  - `unprefixed|<names>`: "Claude named it <name>, without your tag. In the practice window, type: 'Please rename it to start with <prefix> before we deploy.'"
  - `short|<what>` or `missing|<what>`: say what is missing in plain words and give them the words to ask Claude to add it. Check again when they come back.
  - `browser|csv-import` (NetSuite data load): read the import results page yourself with `browser-use` (Setup, Import/Export, View CSV Import Status) and count the records added.
  - `ORG|missing` or `ORG|expired`: "Your practice org signed you out. Let's sign in again." Connect it again as in Phase 6, then check again.
- For Analysis: read the document and the retrieved files from their practice project on GitHub (as in Phase 5's Checking Their Work), and judge whether the document explains that component: what starts it, what it does, what it touches, the risks.

**5. Capture the evidence (practice window).** 👉 `Try It Yourself` Give them the words: "Use browser-use to open <what they built> in my practice org and take a screenshot. Save it in the screenshots/ folder of this project and send it to GitHub. Then add a comment to <KEY> with a link to the screenshot on GitHub, and move the story to Done." For Analysis: "Add a comment to <KEY> with links to the solution document and a screenshot on GitHub, and move the story to Done." The Jira tools cannot upload files, so evidence lives on GitHub and the story links to it. Then check yourself: the screenshot is on GitHub (as in Phase 5's Checking Their Work), and the story is Done with the plan comment and a comment linking the evidence.

**Record it** only when both checks pass (use `p7-ns-<id>` for a NetSuite exercise): `node "<SKILL_DIR>/scripts/tutor.mjs" step p7-<id> complete "<one line summary>" --jira <KEY> --evidence "<the CONFLICT line>; <the check-exercise line>; story <KEY> Done"` (Analysis deploys nothing, so it has no CONFLICT line). Then one ❓ `Knowledge Check` in the picker, as a short "Imagine" scenario about the skill they just used (the header names the topic), save, refresh the outline page, and show the course card.

## Picking Up an Exercise in Progress

On every start, `state` lists `jira`: the story key recorded for each step. If the next exercise already has a story, never create a second story. Say "Welcome back. You were working on Exercise <n>, story <KEY>." Read the story and the practice project to see how far they got (plan comment, pull request, what is in the org), and pick up at that step. Skip the phase introduction when any exercise has a story.

## Redoing an Exercise

A finished exercise keeps its credit. If they want to redo one for practice, follow the router's Going Back for Practice: the redo reuses its story (they ask Claude to update `<KEY>`, not create a new one), updates their own components, and records nothing new.

## Rules for Every Exercise

- Always write the labels with their emoji, exactly: 💡 `Key Idea`, 👉 `Try It Yourself`, ❓ `Knowledge Check`.
- Never name the checks, commands or result lines to them. Say what you found in plain words, a few short bullets at most, and then what to do next.
- Ask a Knowledge Check only once an exercise is recorded, never in the middle of a step.
- Never rename their work with a new tag to get past a check: that leaves the old copy behind in the org. Fix the work under the same names.
- Never delete anything in the org during the exercises, including its own earlier copies, and never deploy over a name the conflict check says is taken. Leftovers go in the optional cleanup after the demo.
- The names and ids in a pack are examples: any name or id that starts with the tag passes. Accept what Claude chose, and never ask Claude to change an id to match the pack.
- Never put customer data, passwords or tokens in a story, a comment or a file. Mock data uses made-up names only.
- Describe the org only with `org-info`; never print the org's sign-in details.

## Close the Phase

When all six are complete, refresh the outline page, run `node "<SKILL_DIR>/scripts/tutor.mjs" map` and show the course card exactly as printed, in a code block. Say "You've built a working renewal tracker and explained an existing automation, all with Claude. Next: 8, Record and Share Your Learnings, the last step of your foundation." Then load `modules/phase-8-demo.md`.
