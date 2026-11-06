---
name: meeting-to-project-actions
description: Extracts project actions (owner tasks, follow-ups, open decisions someone must close) from any Plative project meeting transcript or notes, checks them against open Jira tasks for overlap, presents them for review in an interactive artifact, then creates approved actions as Jira Tasks assigned to the project manager. Use when the user provides a meeting transcript (discovery, status, design review, UAT, steering) and a Jira project key and asks to capture action items, create follow-up tasks, log actions in Jira, or turn meeting next steps into tickets. Also use when discovery-to-userstories reports project actions and the user wants them in Jira.
---

# Meeting to Project Actions

## Purpose

Extract project actions from a project meeting transcript, present them for review in an interactive artifact, then create approved actions as Jira Tasks. Every task is assigned to the project manager when it is created. The PM decides who to reassign it to, whether that is a Plative resource or a customer user.

This skill does not create user stories. System requirements belong in discovery-to-userstories.

## Trigger

Use this skill when the user provides a meeting transcript or meeting notes and a Jira project key, and asks to capture action items, create follow-up tasks, or log next steps in Jira. Any project meeting type qualifies: discovery, status, design review, build review, UAT, cutover, or steering.

## Inputs

Collect these before starting. Ask for anything missing in one message.

- Meeting transcript (uploaded file or pasted text) or meeting notes
- Jira project key (e.g., HESO, OMNI)
- Project manager name (the person every task is assigned to at creation)
- Meeting date, if it is not clear from the transcript. It is needed to resolve relative dates such as "by Friday."

## Tools

This skill uses the Atlassian (Jira) connector. Refer to its tools by function name (`lookupJiraAccountId`, `searchJiraIssuesUsingJql`, `getIssueLinkTypes`, `createJiraIssue`, `createIssueLink`, `addCommentToJiraIssue`, `getAccessibleAtlassianResources`). Do not rely on a connector-specific prefix, because the prefix differs between users and sessions. If the Atlassian connector is not connected, tell the user and stop.

---

## Workflow

### Step 0: Confirm the project manager

Call `lookupJiraAccountId` with the PM name the user provided.

- **One match:** confirm in chat: "Tasks will be assigned to [Display Name] ([email]) as project manager."
- **Multiple matches:** list them and ask the user to pick one.
- **No match:** tell the user and ask for the PM's email address or Jira display name. Do not continue until the PM resolves to a Jira account.

Store the PM's account ID for Step 4.

---

### Step 1: Extract project actions from the transcript

Read the full transcript.

**A project action** is a task a named person or party must complete for the project to move forward. Examples:

- "Mary will send a sample custodian file by Friday"
- "Plative to confirm the FSC license tier needed for Action Plans"
- "Schedule a follow-up session with the compliance team"
- "Customer to decide whether wholesalers or ops own Account updates"
- "Josh to get sign-off from legal on the disclosure language"

**These are not project actions. Leave them out:**

- **System requirements** (something Salesforce must do). These belong in discovery-to-userstories. If you find several, mention it in Step 5.
- **Decisions already made in the meeting.** A decision is only an action if someone still has to confirm, document, or communicate it.
- **General statements with no task**, such as "we should think about reporting at some point." Include one only if someone took ownership.
- **Work completed during the meeting.**

For each action, draft the following fields.

**Summary**
A short imperative statement, verb first, under 12 words. Match these examples:

- "Send sample custodian file for data mapping"
- "Confirm FSC license tier required for Action Plans"
- "Decide ownership of Account updates between wholesalers and ops"

**Proposed owner**
The person or party named in the transcript, with their side in parentheses: "Mary Chen (Customer)", "Sebastian (Plative)", "Customer IT (Customer)". Write "Not stated" if no one was named. This field records who the transcript says should do the work. It does not set the Jira assignee.

**Owner side**
One of: Customer, Plative, Not stated. Used for the label in Step 4.

**Due date**
- If the transcript states an exact date, use it.
- If the transcript states a relative date ("by Friday", "end of next week", "before the next session"), resolve it against the meeting date. Resolve "before the next session" only if the session date was stated.
- If no date was stated or the date is ambiguous, leave it blank and set the flag `No due date`. Do not guess.

Format dates as YYYY-MM-DD.

**Description** (markdown string)
Structure as follows. Omit any section with no supporting content. Do not include placeholder text.

```
### Proposed Owner
[Name (Side)]

### Context
[1 to 3 sentences on why this action exists and what it unblocks. Paraphrase or quote what was said. Include speaker name if identifiable.]

### Source
[Meeting type and date, e.g., "Design review, 2026-10-01"]

### Done When
[One sentence describing what completes the action, e.g., "Sample file with 50+ rows is shared in the project folder."]
```

---

### Step 2: Check Jira for overlap and related work

Before building the review artifact, tell the user:

> "Checking the actions from this meeting against open tasks in [PROJECT_KEY] and looking for related stories..."

**2a. Open tasks.** Query with `searchJiraIssuesUsingJql`:

```json
{
  "cloudId": "af1b8621-4899-471a-9213-927037d578a1",
  "jql": "project = [PROJECT_KEY] AND issuetype = Task AND statusCategory != Done ORDER BY created DESC",
  "maxResults": 100,
  "fields": ["summary", "description", "assignee", "duedate", "status"],
  "responseContentFormat": "markdown"
}
```

Keep paging until you have read every open task.

Compare each drafted action against the open tasks semantically. Classify each action:

- **New:** no open task covers it. Checked by default.
- **Duplicate:** an open task already covers it and the meeting added nothing new. Unchecked by default. Note: "Already open in Jira as [KEY]: [summary]."
- **Update:** an open task covers it, but the meeting added new information (a new date, a new owner, a status change, or a blocker). Checked by default. This adds a comment to the existing task instead of creating a new one. Note: "Will add a comment to [KEY]: [summary]."

**2b. Related stories.** Query stories and epics in the project:

```json
{
  "cloudId": "af1b8621-4899-471a-9213-927037d578a1",
  "jql": "project = [PROJECT_KEY] AND issuetype in (Story, \"User Story\", Epic) AND statusCategory != Done ORDER BY created DESC",
  "maxResults": 100,
  "fields": ["summary", "issuetype", "status"],
  "responseContentFormat": "markdown"
}
```

Keep paging until you have read every open story and epic. For each New action, propose a related story only when the action clearly unblocks or feeds that story. Propose at most two per action. Do not force a match.

**2c. Link type.** Call `getIssueLinkTypes` once. Use `Blocks` if it exists. Otherwise use `Relates`.

If the cloud ID call fails at any point, call `getAccessibleAtlassianResources` and use the cloud ID for plative.atlassian.net.

Report the result in chat before building the artifact:

> "Found [N] actions. [X] are new, [Y] are already open in Jira, and [Z] update existing tasks. [W] have no due date and are flagged for the PM."

---

### Step 3: Build the review artifact

Create an interactive HTML review page with the session's artifact tool.

The artifact must include:

- **Header:** project key, meeting type and date, total action count, and "Assigned to: [PM Display Name]"
- Actions grouped by owner side (Customer, Plative, Not stated)
- Each action rendered as a card with:
  - Checkbox (checked by default for New and Update; unchecked for Duplicate)
  - Summary as the card title, editable inline
  - Proposed owner
  - Due date as an editable date input. Show a "No due date" badge when blank.
  - Status badge: none for New; "Already Open" for Duplicate; "Updates [KEY]" for Update
  - For Duplicate and Update: the matching Jira key and summary
  - Related story suggestions, each with its own checkbox (checked by default) so the reviewer can drop a link
  - Full description collapsible (collapsed by default)
- A **"Push Selected to Jira"** button
- A status area below the button that updates in real time (e.g., "Creating 1/5... HESO-88 created. Linking to HESO-42... Creating 2/5...")

Embed the project key, PM account ID, link type, and all action data as JavaScript variables at render time.

**Fallback:** if the artifact cannot call the Atlassian connector in this session, replace the push button with a "Copy selected actions" button. Ask the user to confirm the selection and any edits in chat, then run Step 4 yourself.

---

### Step 4: Push to Jira

For each checked action, in order:

**New actions:** call `createJiraIssue`.

```javascript
{
  cloudId: "af1b8621-4899-471a-9213-927037d578a1",
  projectKey: "[project key]",
  issueTypeName: "Task",
  summary: "[action summary]",
  description: "[cleaned description string]",
  contentFormat: "markdown",
  assignee_account_id: "[PM account ID from Step 0]",
  additional_fields: {
    "duedate": "[YYYY-MM-DD, omit this key entirely if blank]",
    "labels": ["project-action", "[owner-customer | owner-plative | owner-not-stated]"],
    "priority": { "name": "Medium" }
  }
}
```

Use priority High only if the transcript explicitly calls the action urgent or blocking a go-live date.

Then, for each checked related story, call `createIssueLink`. The action blocks the story:

```javascript
{
  cloudId: "af1b8621-4899-471a-9213-927037d578a1",
  type: "[Blocks or Relates, from Step 2c]",
  inwardIssue: "[new task key]",
  outwardIssue: "[related story key]"
}
```

**Update actions:** call `addCommentToJiraIssue` on the existing task. Do not change its assignee, due date, or status.

```
Update from [meeting type], [meeting date]:
[1 to 2 sentences on what changed: new date, new owner, blocker, or status.]
```

**Duplicate actions** that the reviewer checked anyway are created as New actions.

If a call fails, record the error, continue with the remaining actions, and report the failures at the end.

---

### Step 5: Report results

In chat, show a table with columns: Key (as a link to `https://plative.atlassian.net/browse/[KEY]`), Summary, Proposed Owner, Due Date, Linked To.

Then add, only when they apply:

- "[N] actions have no due date. [PM name] should set them when reassigning."
- "[N] actions have no named owner."
- "[N] comments were added to existing tasks: [keys]."
- "[N] calls failed: [summary and error]."
- "This transcript also contains system requirements. Run discovery-to-userstories on it to capture them as stories."

---

## Formatting Rules (Critical)

**Description string:**

- Separate section headers (`### Context`, etc.) from their content with a single `\n`
- Separate sections from each other with exactly one blank line (`\n\n`)
- No trailing newline at the end of the string
- No consecutive blank lines (`\n\n\n` is never valid)

Example:

```
### Proposed Owner\nMary Chen (Customer)\n\n### Context\nMary confirmed she can export a sample from the custodian portal. The data mapping session cannot start until the team reviews real field values.\n\n### Source\nDesign review, 2026-10-01\n\n### Done When\nSample file with at least 50 rows is shared in the project folder.
```

Before passing any string to the Jira API, apply this cleanup:

1. Replace any sequence of 3+ newlines with 2 newlines
2. Remove trailing whitespace and newlines
3. Remove leading whitespace and newlines

---

## Quality Check Before Building Artifact

Before Step 3, verify:

1. Every action traces to something said in the transcript. Do not invent actions.
2. No two drafted actions cover the same task (internal deduplication)
3. No system requirement was drafted as an action
4. No due date was guessed. Every date is stated or resolved from a stated relative date.
5. Each action has one clear deliverable. Split any action that bundles two owners or two outcomes.

---

## Reference: Jira and Atlassian Constants

- Atlassian cloud ID for plative.atlassian.net: `af1b8621-4899-471a-9213-927037d578a1`
- Issue type: `Task`
- Assignee at creation: the project manager named by the user at each run (resolved in Step 0). Never hardcode an account ID.
- Labels: `project-action` plus one of `owner-customer`, `owner-plative`, `owner-not-stated`
- Default priority: Medium
- Link direction: action (inward) blocks story (outward)
