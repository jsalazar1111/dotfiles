# Phase 6: Connect Your Tools

This phase runs in the Chiron window. The person connects two things: a practice org for their platform, and Jira. Settings come from `config.json`: the org name to use in commands (`sandboxAlias`), and the Jira site, project and work item type (`jiraSite`, `jiraProjectKey`, `jiraIssueType`). Never type them from memory. Use the labels from the router: 💡 `Key Idea` for the idea, 👉 `Try It Yourself` for what they do.

## Your Practice Org [p6-sandbox]

Do this once for each platform the person chose. If they chose both, say how many are left as you go, for example "One more sign-in left: NetSuite."

1. 💡 `Key Idea` Remind them plainly first: "Use an internal Plative org with mock data, such as a dev sandbox, a scratch org or a partner demo org. Never use a customer org or a customer sandbox, even for practice. If you don't have an internal org, ask your leader." There is no automatic check of the org type, so this reminder and their answer below are what keep them on an internal org and never a customer org.
2. Connect it.
   - Salesforce: first ask in the picker, with the header "Org type": "Which kind of org will you sign in to?" Options: a sandbox; a developer, scratch or partner demo org. Then run `sf org login web --alias <sandboxAlias>` yourself. For a sandbox, add `--instance-url https://test.salesforce.com`. If they give you their org's own web address (a My Domain address), use that as `--instance-url` instead. It waits until they finish, so run it with a timeout of 10 minutes (600000 ms), or in the background and then check with `org-info` (step 3). People with two-step sign-in can take a while. Say first, as a 👉 `Try It Yourself`: "A Salesforce sign-in page is opening in your browser. If you don't see it, it sometimes opens behind this window: click your browser in the Dock or the taskbar. Sign in to your practice org, then click Allow. It's normal for this window to wait quietly until you finish." On a Mac, a Keychain prompt may ask to let `sf` save the sign-in: they click Always Allow.
   - NetSuite: the setup asks questions, so the person runs it, outside Claude, in a NetSuite practice project. If their practice project is a Salesforce one, make a NetSuite one first in their learning folder with `suitecloud project:create` (check `--help` for the options that avoid questions), named `my-netsuite-project`. Then, as a 👉 `Try It Yourself`, click by click: in VS Code, open that project with the File menu, then Open Folder. Click the Terminal menu, then New Terminal. They type `suitecloud account:setup` and press Return (Enter on Windows). Walk them through its questions one at a time: it asks for the environment (they choose sandbox, unless their leader said otherwise), the account ID (Your leader can give you the account ID), then opens the browser to sign in. They sign in to their practice account, and when asked for a name, type `<sandboxAlias>`. Ask what they see after each answer.
3. Show what they connected, so they can see it is the org they meant: run `node "<SKILL_DIR>/scripts/tutor.mjs" org-info <sandboxAlias>` for Salesforce, or `suitecloud account:manageauth --list` for NetSuite. `org-info` prints `ORG|ok|<web address>|<user>|<status>`, or `ORG|missing|<alias>` when the sign-in did not finish: then connect it again. Never use Salesforce's own org display command for this: it prints the org's sign-in secret. Tell them the org's web address and the user in one sentence, never the raw output.
4. Ask in the multiple-choice picker, with the header "Your org": "Is this an internal Plative org with mock data, and not a customer org?" Options:
   - "Yes, it's internal with mock data, not a customer org": record `p6-sandbox` complete with the summary "Acknowledged: internal org with mock data, not a customer org".
   - "No, it belongs to a customer": stop. Say "Thanks for checking. Please don't use a customer org for practice. Ask your leader for an internal Plative org, and we'll connect that one instead." Record `p6-sandbox` as `blocked` with the reason.
   - "I'm not sure": stop. Say "Please check with your leader before we go on. Once you know it's an internal org, we'll pick up right here." Record `p6-sandbox` as `blocked`.

An "Other" reply that is not a clear yes counts as "I'm not sure". The exercises stay locked until this step is complete. Never connect a different org for them without asking the question again.

## Jira [p6-jira]

1. 💡 `Key Idea` "Each exercise becomes a story in Jira, so you get used to planning and tracking your work there. The project is a learning space where any story is welcome. No customer data ever goes in a story."
2. Check that you have the Atlassian tools from their claude.ai connectors (their names mention Atlassian). If you have them and they work, go to step 3. If the tools are listed but ask to be signed in, or are missing, 👉 `Try It Yourself`, click by click:
   - In this window, type `/mcp` and press Return. Use the arrow keys to pick `claude.ai Atlassian`, press Return, and choose the option to sign in. A browser page opens: sign in with their Plative account and click Accept. Back here, tell me when it says connected.
   - If `claude.ai Atlassian` is not in the `/mcp` list, connect it in claude.ai first: click their name at the bottom left, then Settings, then Connectors. If you don't see Connectors, tell me what you see. Find Atlassian and click Connect, sign in with their Plative account, and click Accept. Then they type `/exit`, then `claude`, then `/chiron-ai-delivery-coach`, and you pick up right here.
3. With the Atlassian tools, find the `jiraProjectKey` project on `jiraSite` among the projects they can see, and confirm it offers the `jiraIssueType` work item type. The first time you use these tools, a browser page may open asking for access: they click Accept. Do not create anything yet: the first story comes with the first exercise.
4. If the project is not visible, record `p6-jira` as `blocked`, and give them this note for `#ai-native-plative`, with the values filled in from `config.json`: "Please give me access to the <jiraProjectKey> Jira project at <jiraSite>."

Record `p6-jira` when the project is visible and offers the `jiraIssueType` type.

## Close the Phase

Refresh the outline page. Run `node "<SKILL_DIR>/scripts/tutor.mjs" map` and show the course card exactly as printed, in a code block. Say "Your tools are connected. Next: 7, Agentically Configure <platform>." Then load `modules/phase-7-exercises.md`.
