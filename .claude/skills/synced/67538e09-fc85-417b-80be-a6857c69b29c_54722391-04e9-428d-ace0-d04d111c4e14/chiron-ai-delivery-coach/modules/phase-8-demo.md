# Phase 8: Record and Share Your Learnings

The person records one short demo of agentic configuration and shares it in `#ai-native-plative` on Slack. You coach; you never grade the demo, the channel reviews it. Use the labels from the router: 💡 `Key Idea`, 👉 `Try It Yourself`.

## Plan the Demo [p8-demo-plan]

1. 💡 `Key Idea` "Your demo shows how you work with Claude, not how fast you click. A short, honest demo beats a long, polished one."
2. Suggest a mix of two or three exercises that show different skills (for example, the data model, the automation and the analysis). Ask in the picker, with multiple choice, which ones they want to feature. Any number is fine.
3. For each one they picked, read its Jira story and its ledger row, and draft a two-sentence summary: what the business needed and what Claude built.
4. Coach the four beats, one at a time:
   - **set the scene:** the business need in one or two sentences, as if to a customer.
   - **let Claude build:** show the story, the plan and Claude at work in the practice window. Speed it up or cut the waiting.
   - **prove it works:** show the result in the org, and the story moved to Done.
   - **wrap up:** what you'd do next on a real project, and one thing you learned.
5. 👉 `Try It Yourself` In the practice window, type: "Write my demo plan in notes/demo-plan.md with these beats and summaries, and send it to GitHub." Paste the summaries into the request for them.

Record `p8-demo-plan` once the plan is on GitHub.

## Rehearse, Record and Share [p8-demo]

1. Suggest one rehearsal out loud. Then they record their screen: on a Mac, Command+Shift+5, then Record Entire Screen or Record Selected Portion; on Windows, Windows+Alt+R starts recording the window (or use the Snipping Tool's Record button).
2. 👉 `Try It Yourself` They post the recording in `#ai-native-plative` on Slack, with a line about what it shows. Then they copy the link to their post: hover over the message, click the three dots, then Copy link, and paste it here.
3. The link must look like `https://<workspace>.slack.com/archives/<channel>/p<number>`. If it doesn't, ask again.

Record `p8-demo` with `--evidence "<the Slack link>"`. Congratulate them warmly: they have finished the course.

## Clean Up, If They Want [optional]

Offer this only after the demo link is recorded, and only once. It is optional: their builds stay in the org if they prefer. Say: "Your practice org may be shared, and it has limits on things like custom objects. Now that your demo is shared, I can remove what you built, so it stays tidy for others. Only things tagged with your name are touched. Would you like that?"

**Salesforce:**
1. Run `node "<SKILL_DIR>/scripts/tutor.mjs" cleanup-list`. Show them exactly what will go, by name, and how many records: `CLEANUP|records|<n>` and each `CLEANUP|item|<type>:<name>`.
2. Ask in the picker, with the header "Clean up": "Remove these <n> items and <records> records from your practice org?" Options: yes, remove them; no, keep everything.
3. Only after a yes: run `node "<SKILL_DIR>/scripts/tutor.mjs" cleanup-run --confirmed`. For each `CLEANUP|kept|<item>|<reason>`, say in plain words what stayed and why. Never force a deletion.
4. If the custom object was removed, tell them: "Salesforce keeps a deleted object for 15 days, and its name stays taken until it is erased. To remove it for good: in Setup, search for Deleted Objects, then choose Erase next to your object." Run `cleanup-list` once more to confirm: the only item left should be that deleted object.

**NetSuite:** the SuiteCloud tools cannot delete objects, so the removal happens in NetSuite itself. Once they have confirmed the list, you do the clicking in their browser with the `browser-use` plugin from Phase 5. If that tool is not available, or a page stops responding, guide them click by click instead, asking what they see after each step. Never type their password: if NetSuite shows its sign-in page, ask them to sign in themselves and tell you when they see their home page.
1. **Find what they built (read only).** In their NetSuite project folder, run `suitecloud object:list --type <type> --scriptid <their tag>` for each of these types: `customrecordtype`, `workflow`, `savedsearch`, `entryform`, `customlist`, `workbook`, `dataset`. Then find their mock customers: search NetSuite for their tag and open the Customer results. Their tag is the `prefix` in their profile.
2. **Ask first.** Show the names, in the picker with the header "Clean up": "Remove these <n> items from your practice account?" Options: yes, remove them; no, keep everything. Nothing is deleted before a yes.
3. **Delete in this order**, because later items depend on earlier ones. Each item: open its page, read the name, the id and the description ("Created by Chiron for <their email>"), and stop and tell them if any of the three does not match. Then delete it, and open the item's own page again: it must say it does not exist. Do not trust a search to confirm it, because the search can stop listing items before they are gone.
   - **Workflows:** Customization, Workflow, Workflows. Open theirs, choose Edit, then Actions, then Delete.
   - **Record Types:** Customization, Lists, Records & Fields, Record Types. Open theirs, Edit, Actions, Delete. This also removes the records inside it, its form and its saved searches.
   - **Lists:** Customization, Lists, Records & Fields, Lists. Open each of theirs, Edit, Actions, Delete.
   - **Customers:** Lists, Relationships, Customers. Open each customer named with their tag, Edit, Actions, Delete.
   - **Workbooks:** Analytics, Workbooks. On their card, open the three dots, choose Delete, and read that the box names their workbook before you confirm.
   - **Datasets:** Analytics, Datasets. In their row, open Actions, choose Delete, and read that the box names their dataset before you confirm.
4. **A waiting box.** NetSuite asks "Are you sure?" on records with a small box from the browser itself. If the page stops responding after a delete, say: "A small box may be waiting in your browser. Click OK, only if it names <the item>." Then carry on.
5. **Finish.** Then search for their tag once more and say what is left, if anything. Touch only items whose ids or names contain their tag.

Jira stories, their practice projects and their progress are never touched by cleanup.

## Close the Foundation

Refresh the outline page, run `node "<SKILL_DIR>/scripts/tutor.mjs" map` and show the course card exactly as printed, in a code block. Say: "You've finished the foundation and earned your foundational certification: from setting up your AI tools to building and demoing real configuration with Claude." Then offer what sits below the line: "Next, if you'd like: 9, Level Up With Advanced Claude Code Tips, seven short lessons that help you work longer and cleaner. It's optional." If they say yes, load `modules/phase-9-level-up.md`. If not, say they can type `/chiron-ai-delivery-coach` anytime to take it, and that Ongoing Coaching comes later.
