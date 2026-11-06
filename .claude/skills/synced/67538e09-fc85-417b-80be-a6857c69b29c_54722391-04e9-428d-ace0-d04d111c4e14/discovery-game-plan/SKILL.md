---
name: discovery-game-plan
description: >
  Generates a Plative discovery game plan as a Google Sheet from a project SOW (or
  Change Order), MANTRA document, and KT (Knowledge Transfer) document or pre-sales
  call transcripts. Includes an interactive consultant review step before output is
  created. Use whenever a Salesforce project is entering the discovery phase and the
  team needs to plan and schedule discovery sessions. Trigger when the user says
  anything like "create a discovery game plan", "build the discovery schedule",
  "set up discovery sessions", "plan discovery from the SOW", "generate discovery
  agenda", or "put together the discovery plan". Also trigger when the user provides
  or references a SOW plus pre-sales materials and asks what sessions to run or how
  to structure discovery. Always use this skill before building any discovery planning
  spreadsheet — never attempt to create one from scratch without it.
---

# Discovery Game Plan Generator

This skill produces a Plative discovery game plan as a Google Sheet. Before generating
the output, it presents the planned sessions to the consultant for review and
incorporates their feedback.

---

## Inputs

The user provides paths to some or all of the following. Proceed with whatever is
available; note gaps as assumptions.

| Input | What it is | What you extract |
|---|---|---|
| **SOW or Change Order** | Signed contract or amendment (.docx or .pdf) | Number of contracted discovery sessions, scope, deliverables, integrations, in/out-of-scope, Plative team, client contacts |
| **MANTRA document** | Pre-sales opportunity summary | Project mandate, client contacts, risks, timeline, Plative team, open questions |
| **KT document** | Knowledge Transfer: sales-to-delivery handoff form | Client team (names, titles, TZ, roles), Plative team, project synopsis, pain points, risks, strategic questions |
| **Pre-sales transcripts** | Raw call notes, if no KT exists | Client stakeholders, pain points, environment, priorities |

**MANTRA documents may contain multiple deal notes.** Find the section for this
project and extract only that. Ignore all other deals.

**SOW vs. Change Order:** A Change Order covers a subset of scope. If only a Change
Order is available, extract what it defines and note the original SOW was not provided.

---

## Step 1 — Extract from Each Document

Build an internal working inventory. Do not show this to the user unless they ask.

### Critical: Read the SOW for the contracted discovery session count

The SOW specifies how many discovery sessions are in scope (e.g., "2 × 1 hr sessions"
for process flows, "1 × 1 hr session" for prompts and guardrails, etc.).
**Design exactly that many sessions.** If the SOW does not specify a count, use scope
breadth to estimate.

### From SOW / Change Order:
- Number of contracted discovery sessions (hard constraint)
- All in-scope deliverables and features
- Named Salesforce clouds, products, or feature areas
- Integration requirements
- Data migration scope
- Explicit out-of-scope exclusions
- Named Plative team members and roles
- Named client stakeholders and roles

### From MANTRA document:
- Project mandate and desired business impact
- Key client contacts with names and titles
- Risks and open questions
- Plative team assignments
- Timeline commitments or deadlines

### From KT document:
- Full client project team: names, titles, time zones, project roles
- Plative team: CP, DM, SA, consultant, BA
- Project synopsis and goals
- Current pain points
- Known risks
- Strategic open items
- Future phases

---

## Step 2 — Design the Sessions

### What discovery sessions are — and are not

Discovery sessions are working sessions where Plative and the client jointly define
requirements, validate current-state processes, and make design decisions.

**Not discovery sessions** (do not include):
- Project kickoff
- Technical architecture review (belongs in design review, after discovery)
- Internal Plative working sessions
- UAT or testing sessions

### Core rules:
- One session = one functional area or tightly related group of features/use cases
- Standard duration: 60 minutes. 90 minutes for Solution Readback only.
- Split into Part 1 / Part 2 if a functional area has more than 8–9 agenda items
- One final Solution Readback at the end — no per-go-live readbacks unless the SOW
  explicitly defines separate build phases with separate design gates
- Total session count must match the SOW

### Dependency ordering:

CRM/FSC projects:
Data model → automation/process logic → reporting → integrations → migration → Solution Readback

Agentforce / AI projects:
Process flows and data sources → prompts and guardrails → Solution Readback

### Session patterns by project type:

**Standard Sales Cloud / CRM:**
- Sales process, pipeline, and opportunity management
- Account and contact data model + page layouts
- Reporting, dashboards, and KPI review
- Integration scoping (one session per integration or closely related pair)
- Data migration planning
- UI/UX and configuration cleanup
- Solution Readback

**Financial Services Cloud (FSC)** — same as above, plus as applicable:
- Household and client data model
- Financial account / AUM data
- Activity and interaction tracking
- Referral management
- Rollup and aggregate configuration
- Compliance and audit trail

**Agentforce / Service AI projects:**
1. **Process Flows and Data Sources Review (Part 1 of N)** — group 3–4 use cases per session; name them in the title and agenda. Repeat as Part 2, Part 3 as needed.
2. **Prompts, Guardrails, and AI Transparency** — one cross-cutting session covering all use cases. Required for every Agentforce project.
3. **Solution Readback & Discovery Sign-Off** — final gate before build.

Group Agentforce use cases by similarity: verification/identity together; status/inquiry together; case creation/escalation together; redirects/FAQ together.

---

## Step 3 — Present Session Plan for Consultant Review

Before writing any pre-work, agenda details, or generating output, present the
planned sessions to the consultant and get their sign-off.

Format the plan as a clear numbered list. For each session include:
- Session number and title
- Duration
- Client attendees (names)
- Plative attendees (names)
- 3–5 bullet points summarizing the key topics to be covered

Then ask the consultant to respond for each session with one of:
- **Accept** — session looks good as-is
- **Update** — include their specific changes (title, attendees, topics, duration, or order)
- **Reject** — remove this session from the plan

Wait for their response before proceeding. Do not generate the full session detail
or the output until feedback is received.

After receiving feedback:
- Apply all updates and removals
- If a session was updated, confirm the revised version briefly before moving on
- If a session was rejected and this affects scope coverage, flag it

---

## Step 4 — Build Full Session Detail

Once the consultant approves the session plan, expand each session with the full
detail needed for the output.

For each session, produce:

### Session title
Format: `[N]. [Functional Area] ([Part N of N if applicable])`

### Client pre-work
What the client must prepare before the session:
- Specific artifacts to share with Plative in advance (name them)
- Internal decisions the client needs to make
- People or system owners to identify or confirm
- Access or demos to prepare
- Mark completed items `[DONE]` if known from KT/pre-sales

### Plative pre-work
What Plative needs to do before the session:
- Artifacts to review
- Analysis to complete
- Drafts to prepare for in-session review
- Outputs from a prior session that must be processed first

### Dependencies
What must be complete before this session is productive. Reference prior sessions
or Plative deliverables by name. Leave blank if no meaningful dependency.

### Agenda
Numbered list of 6–12 specific items with action verbs: Confirm, Review, Define,
Validate, Walk through, Sign off on.

Bad: "Discuss use cases"
Good: "1. Walk through Customer Verification use case: confirm identity fields (email, zip code), validation logic, and failure handling"

For Agentforce sessions, every in-scope use case must appear explicitly in the agenda.

### Duration
60 min default. 90 min for Solution Readback.

### Proposed date
Leave blank — the PM populates this.

### Client attendees
Actual names from SOW/MANTRA/KT. Mark as `(optional)` where applicable.

### Plative attendees
Actual names where available; role labels otherwise.

### Key outputs
What Plative will produce after this session.

### Risks mitigated
What risk or open question this session resolves.

---

## Step 5 — Create the Google Sheet

Use the Google Drive MCP tool (`mcp__81b1f5c7-9fc3-45cd-b0c5-879c167a28b8__create_file`)
to create a Google Sheet directly. Do not create an xlsx file.

### How to create the Google Sheet

Build the data as a properly quoted CSV string, then call create_file:
- `title`: `[Client Name] - Discovery Game Plan`
- `textContent`: the CSV string (see format below)
- `contentMimeType`: `text/csv`
- Leave `disableConversionToGoogleType` unset (default false converts CSV → Google Sheet)

### CSV format

The first row is headers. Each subsequent row is one session.

Headers (in order):
```
Session,Client Pre-Work,Plative Pre-Work,Dependencies,Agenda,Duration (min),Proposed Date,Client Attendees,Plative Attendees,Key Outputs,Risks / Notes
```

For cell values that contain commas or newlines, wrap in double quotes. Use `\n`
within quoted strings for line breaks within a cell (agenda items, pre-work bullets).
Escape any existing double quotes within a value as `""`.

Example cell with line breaks:
```
"1. Confirm identity fields\n2. Define validation logic\n3. Review failure handling"
```

### After creating the sheet

The tool returns a file object with an `id` and `webViewLink`. Share the link with
the consultant so they can open the sheet directly.

---

## Output Quality Check

Before calling create_file, verify:

1. Session count matches the SOW
2. No kickoff, architecture review, or non-discovery sessions included
3. Every in-scope SOW deliverable is covered by at least one session
4. No session has fewer than 5 or more than 12 agenda items
5. Agentforce projects include a "Prompts, Guardrails, and AI Transparency" session
6. Solution Readback is the final session with all workstream owners on both sides
7. Client and Plative pre-work are specific and actionable
8. Google Sheet title: `[Client Name] - Discovery Game Plan`
