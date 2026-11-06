---
name: discovery-to-userstories
description: Extracts user stories from a Salesforce discovery session transcript, checks them against the existing Jira backlog for overlap, presents them for consultant review in an interactive artifact with checkboxes, then pushes approved stories to Jira. Also flags project actions found in the transcript and hands them off instead of turning them into stories. Use when the user provides a discovery transcript and a Jira project key and asks to extract user stories, build a backlog, or create Jira tickets from the session.
---

# Discovery to User Stories

## Purpose

Extract user stories from a Salesforce discovery session transcript, present them for consultant review in an interactive artifact, then push approved stories to Jira. Project actions found in the transcript are kept out of the story backlog and handed off separately.

## Trigger

Use this skill when the user provides a discovery session transcript (uploaded file or pasted text) and a Jira project key, and asks to extract user stories, build a backlog, or create Jira tickets from the session.

## Inputs

- Discovery session transcript (uploaded file or pasted text)
- Jira project key (e.g., HESO, OMNI)

## Tools

This skill uses the Atlassian (Jira) connector. Refer to its tools by function name (`searchJiraIssuesUsingJql`, `createJiraIssue`, `getAccessibleAtlassianResources`). Do not rely on a connector-specific prefix, because the prefix differs between users and sessions. If the Atlassian connector is not connected, tell the user and stop before Step 2.

---

## Workflow

### Step 1: Extract stories and project actions from the transcript

Read the full transcript. Sort what you find into two buckets.

**User stories** are requirements for the Salesforce solution: something the system must do, store, display, automate, or enforce.

**Project actions** are tasks a person must complete for the project to move forward. They are not system requirements. Examples:

- "Mary will send a sample custodian file by Friday"
- "Plative to confirm the FSC license tier needed for Action Plans"
- "Schedule a follow-up session with the compliance team"
- "Customer to decide whether wholesalers or ops own Account updates"

Do not convert project actions into user stories, and do not bury them in a story's Dependencies section. If a story depends on an action, name the action in that story's Dependencies section and still list the action separately (see Step 1b).

#### Step 1a: Draft the user stories

Group requirements into epics based on the themes discussed. Infer groupings by business process, feature area, or Salesforce object, whichever fits best for that engagement.

For each requirement, draft a user story with the following fields:

**Summary**
A functional, descriptive title in plain language. Do NOT use "As a..." format. Match the style of these examples from existing Plative stories:

- "Meeting outcome field on activity record drives cadence enrollment"
- "Surface contact-level activity alongside open Opportunity records on advisor Account"
- "Close Opportunity as Allocated while keeping advisor Account active"

**Description** (markdown string)
Structure as follows. Omit any section that has no supporting content from the transcript. Do not include placeholder text.

```
As a [persona], I need [action] so that [outcome].

### Context
[1 to 3 sentences tracing this requirement to the transcript. Paraphrase or quote what was said. Include speaker name if identifiable.]

### Technical Approach (to be confirmed in design)
[Bullet list of likely Salesforce configuration mechanisms: Flow, picklist, page layout, custom field, etc. Note open decisions. Omit if nothing concrete was discussed.]

### Dependencies
[Other stories this depends on, project actions that must close first, or external decisions needed. Omit if none.]

### Considerations
[Risks, tradeoffs, edge cases, scope constraints, or license requirements. Omit if none.]
```

Persona guidance: Use the role names that were used or implied in the session. Common FSC/Salesforce personas: Financial Advisor, Wholesaler, Inside Sales Rep, Operations Manager, Compliance Officer, Sales Manager, System Admin.

The "so that" clause must state a business outcome, not a technical outcome.

**Acceptance Criteria** (plain text, for customfield_10041)
Write 3 to 6 bullet points. Each is a plain statement of observable, testable behavior. No section headers inside the acceptance criteria text. Format each bullet as:

```
• [Condition or behavior that confirms this story is done]
```

#### Step 1b: Capture the project actions

For each project action, record:

- **Action:** a short imperative statement (e.g., "Send sample custodian file")
- **Proposed owner:** the person or party named in the transcript (e.g., "Mary (customer)", "Plative"). Write "Not stated" if no one was named.
- **Due date:** only if stated in the transcript. Otherwise write "Not stated." Do not guess.
- **Source:** a one-line paraphrase or quote with the speaker name, if identifiable
- **Related story:** the summary of any drafted story this action unblocks, if applicable

This skill does not create project actions in Jira. Report them in chat at the end of the run (see Step 5).

---

### Step 2: Check for overlap with existing Jira stories

Before building the review artifact, tell the user:

> "Checking the stories extracted from the transcript against the existing backlog in [PROJECT_KEY] to identify any overlap..."

Then query the Jira project for existing issues using `searchJiraIssuesUsingJql`:

```json
{
  "cloudId": "af1b8621-4899-471a-9213-927037d578a1",
  "jql": "project = [PROJECT_KEY] AND issuetype in (Story, \"User Story\") ORDER BY created DESC",
  "maxResults": 100,
  "fields": ["summary", "description"],
  "responseContentFormat": "markdown"
}
```

If the response shows more results than were returned, keep paging until you have read the full backlog. Do not stop at the first 100.

If the cloud ID call fails, call `getAccessibleAtlassianResources` and use the cloud ID for plative.atlassian.net.

Read the full list of returned stories. Compare each newly drafted story against the existing backlog semantically. A story overlaps if it covers the same functional requirement, even if the wording differs.

Classify each new story as one of three states:

**New:** no existing story covers this requirement. Proceed to the artifact with checkbox checked by default.

**Duplicate:** an existing story already covers this requirement fully. In the artifact, uncheck the checkbox by default and add a note: "Already exists in Jira as [KEY]: [summary]. Review before pushing."

**Needs Update:** an existing story is related but the new story adds meaningful new context, a refined scope, or additional acceptance criteria. In the artifact, keep the checkbox checked but add a note: "Overlaps with [KEY]: [summary]. This story may update or extend the existing one. Review before pushing."

After completing the comparison, report the result to the user in chat before building the artifact:

- If no overlap is found: "Checked all [N] stories against the existing [PROJECT_KEY] backlog. These are all new. No overlap found."
- If overlap is found: "Checked all [N] stories against the existing [PROJECT_KEY] backlog. [X] are new, [Y] appear to already exist, and [Z] overlap with existing stories and may need an update. Review the flagged stories in the artifact before pushing."

---

### Step 3: Build the review artifact

Create an interactive HTML review page with the session's artifact tool.

The artifact must include:

- Project name and total story count at the top
- Stories grouped under epic headings
- Each story rendered as a card with:
  - Checkbox (checked by default for New and Needs Update stories; unchecked by default for Duplicates)
  - Summary as the card title
  - A status badge: no badge for New; "Review: Already Exists" for Duplicates; "Review: May Need Update" for Needs Update
  - For Duplicate and Needs Update stories: a note showing the overlapping Jira issue key and summary
  - Acceptance criteria bullet list always visible
  - Full description collapsible (collapsed by default, expandable on click)
- A **"Push Selected to Jira"** button
- A status area below the button that updates in real time as stories are created (e.g., "Creating 1/6... HESO-74 created. Creating 2/6...")

Pass the project key and all story data into the artifact as embedded JavaScript variables at render time so the artifact does not need to re-read the transcript.

Project actions do not appear in this artifact.

**Fallback:** if the artifact cannot call the Atlassian connector in this session, keep the checkboxes and replace the push button with a "Copy selected story list" button. Ask the user to confirm the selected stories in chat, then create them yourself with `createJiraIssue` using the parameters in Step 4.

---

### Step 4: Push to Jira

When the user clicks "Push Selected to Jira" (or confirms in chat), call `createJiraIssue` for each checked story.

**Call parameters:**

```javascript
{
  cloudId: "af1b8621-4899-471a-9213-927037d578a1",
  projectKey: "[user-provided project key]",
  issueTypeName: "Story",
  summary: "[story summary]",
  description: "[cleaned description string, see formatting rules below]",
  contentFormat: "markdown",
  additional_fields: {
    "customfield_10041": "[cleaned acceptance criteria string, see formatting rules below]",
    "priority": { "name": "Medium" }
  }
}
```

Stories are created unassigned. Do not pass an assignee. The team assigns stories during backlog grooming.

After all stories are pushed, display each Jira issue key as a clickable link: `https://plative.atlassian.net/browse/[KEY]`.

---

### Step 5: Report project actions

After the stories are pushed (or after the user finishes the review, if nothing was pushed), list the project actions from Step 1b in chat as a table with columns: Action, Proposed Owner, Due Date, Source, Related Story.

Then tell the user:

- If the meeting-to-project-actions skill is available in the session: "I found [N] project actions in this transcript. Run meeting-to-project-actions on the same transcript to create them as Jira tasks assigned to the project manager."
- If that skill is not available: "I found [N] project actions in this transcript. They were not added to Jira. Share them with the project manager so they can be tracked."

If no project actions were found, say so in one line.

---

## Formatting Rules (Critical)

These rules prevent the extra `\n` tag issue.

**Description string:**

- Separate the "As a..." line from the first section header with exactly one blank line (one `\n\n`)
- Separate section headers (`### Context`, etc.) from their content with no blank line, just a single `\n`
- Separate sections from each other with exactly one blank line (`\n\n`)
- No trailing newline at the end of the string
- No consecutive blank lines (`\n\n\n` is never valid)

Example of correct formatting:

```
As a wholesaler, I need a structured outcome field on my logged meeting activity so that I can record what happened and trigger the correct follow-up cadence.\n\n### Context\nConfirmed by Josh (2026-06-26): after every advisor meeting, Josh writes notes in Salesforce summarizing the discussion and next action. Current process is unstructured free text.\n\n### Technical Approach (to be confirmed in design)\n- Add a picklist field (Meeting Outcome) to the Event or Task record\n- Recommended values: Moving Forward, Needs Follow-Up, More Time Needed, Not a Fit\n- Record-triggered Flow evaluates outcome on save and initiates cadence enrollment for qualifying values
```

**Acceptance criteria string (customfield_10041):**

- Plain text only: no markdown headers, no ADF
- Each bullet on its own line using `• ` prefix
- Separate bullets with a single `\n`, with no blank lines between bullets
- No trailing newline at the end of the string

Example:

```
• A picklist field (Meeting Outcome) exists on the Event or Task record\n• Picklist values include at minimum: Moving Forward, Needs Follow-Up, More Time Needed, Not a Fit\n• Field is visible and editable by the wholesaler after logging the meeting\n• A record-triggered Flow evaluates the field on save and initiates cadence enrollment for qualifying values
```

Before passing any string to the Jira API, apply this cleanup:

1. Replace any sequence of 3+ newlines with 2 newlines
2. Remove any trailing whitespace or newlines from the end of the string
3. Remove any leading whitespace or newlines from the start of the string

---

## Quality Check Before Building Artifact

Before Step 3, verify:

1. Every story traces to something explicitly discussed in the transcript. Do not invent requirements.
2. No two drafted stories cover the same requirement (internal deduplication)
3. Each story describes work completable within a single sprint. Split anything larger.
4. Any requirement that seems out of scope for declarative Salesforce configuration is flagged in Considerations
5. No project action was drafted as a user story. Move any that were to the Step 1b list.

---

## Reference: Jira and Atlassian Constants

- Atlassian cloud ID for plative.atlassian.net: `af1b8621-4899-471a-9213-927037d578a1`
- Issue type to use when creating: `Story` (not "User Story")
- Acceptance Criteria custom field key: `customfield_10041`
- Assignee: none. Stories are created unassigned.
