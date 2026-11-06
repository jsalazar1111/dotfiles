---
name: project-ramp
description: >
  Generates a structured markdown project summary from a Plative KT document
  and/or supplemental engagement materials, so a new delivery resource can get
  up to speed fast. Works at two stages: pre-kickoff (KT doc is the primary
  source) and mid-engagement (call recordings, Drive folder, status reports,
  UPNs, flow diagrams, Granola/Fellow transcripts). Trigger for: "Project Ramp",
  "ramp for [client]", "prep for [client] kickoff", "load the KT for [client]",
  "new team member joining [client]", "get me up to speed on [client]",
  "onboard someone onto [client]", or any .docx KT attachment alongside "prep",
  "review", "kickoff", "ramp", or "onboard". Also trigger when someone shares a
  Drive project folder link and asks for a project summary. Do NOT use to create
  a KT document — use sales-to-delivery-kt or kt-doc-builder for that.
---

# Project Ramp

Produces a clean, structured markdown project summary the delivery team can
read before a kickoff call, share with a new team member, or reference during
an engagement. No interactive UI — just a well-organized document that covers
what matters and links to everything else.

Operates in two modes. Detect the mode from context — do not ask unless
genuinely ambiguous.

---

## Mode detection

| Mode | Signals |
|---|---|
| **Pre-kickoff** | KT doc is fresh, project hasn't started, phrases like "kickoff", "just signed", "starting next week", SOW recently countersigned |
| **Mid-engagement** | Phrases like "new team member", "joining the project", "we're X months in", "ramping someone on", status reports or call recordings attached, no KT doc present |

If only supplemental documents are provided (no KT), infer mid-engagement and
proceed — supplemental docs become the primary source and KT sections that
can't be populated are marked **NEEDS INPUT**.

---

## Step 1 — Gather inputs

Ask for inputs in a single prompt if none are present. Tailor the ask to the
detected mode.

**Pre-kickoff ask:**
> "Could you share the KT document? Supporting materials (SOW, discovery notes,
> Granola/Fellow transcripts) are optional but increase depth."

**Mid-engagement ask:**
> "To ramp [name/the new resource], share what you have — any combination of:
> the KT doc, the project Drive folder link, recent call recordings (Granola or
> Fellow), status reports, UPNs or flow diagrams, or change orders."

---

### Accepted inputs

**Primary (pre-kickoff):**
- Uploaded `.docx` KT file
- Google Drive link to the KT document

**Supplemental / primary for mid-engagement (any combination):**
- Google Drive project folder link — scan for: KT doc, SOW, change orders,
  BRD, status reports, meeting notes, UPN/flow diagram files
- Granola — query by client name for recent meeting notes
- Fellow.ai — query by client name for recent meeting notes
- Google Meet recordings — these live in Drive; if auto-captions or transcripts
  were generated they appear as companion docs in the same folder and can be
  read directly
- Uploaded status reports, change orders, or meeting notes (any format)
- Inline pasted context

**On visual assets (UPNs, flow diagrams):**
Claude cannot meaningfully summarize a process flow diagram from extracted text
alone — doing so risks producing something misleading. Instead: inventory all
visual asset files found in the Drive folder, surface their names and links,
and note what process area each covers based on filename and folder context.
The new resource opens them directly.

---

## Step 2 — Read all documents

Read `references/parsing-guide.md` for extraction mechanics before processing
any file.

**Reading order:**

1. **KT document first** (if present). Parse into the 10 canonical sections
   per `references/section-map.md`. This is the authoritative base.

2. **Drive project folder** (if a link is provided). Scan the folder and
   produce an inventory: document name, type, last modified date, link. Group
   by type: KT/SOW/Change Orders | Status Reports | Meeting Notes | Visual
   Assets (UPNs, flow diagrams, recordings).

3. **Granola** — search by client name for meetings in the last 90 days.
   Confirm before pulling: "I see Granola connected — should I pull recent
   [client] meetings?" Pull only if confirmed.

4. **Fellow.ai** — same as Granola. If both are connected, check both and
   deduplicate by meeting date and title.

5. **Google Meet transcripts** — if a companion transcript doc is found in the
   Drive folder from a Meet recording, read it the same as any meeting note.
   Raw audio/video files cannot be transcribed — surface the link only.

6. **Supplemental docs** — status reports, change orders, uploaded files.
   Apply enrichment rules below.

**Enrichment rules (supplemental docs add to KT sections, never replace):**

| Section | What supplemental docs add |
|---|---|
| §1 Header | DM name if missing; updated start date |
| §2 Exec Summary | Nothing — KT summary stands |
| §3 Client Profile | New stakeholders from transcripts; updated key terms |
| §4 Scope | Change order additions/removals; scope confirmed vs. SOW |
| §5 Tech Landscape | System details post-sale; migration volumes from status reports |
| §6 Fit-Gap | Gaps confirmed or closed in delivery; new gaps surfaced |
| §7 Stakeholders | New contacts; role changes; behavioral notes from calls |
| §8 Risks | Risks that materialized; new risks; resolved risks |
| §9 Licensing | Change order modules; confirmed user counts |
| §10 Links | SOW link, Drive folder, transcripts used |

Mark any field enriched by a supplemental doc with `[Updated]` so the reader
knows the KT doc alone doesn't tell the full story.

---

## Step 3 — Surface look-alike projects

Query Salesforce in parallel with document reading. Find 2–4 comparable
closed-won Plative engagements. Read `references/salesforce-lookups.md` for
SOQL patterns.

**Match signal cascade:**
1. Same vertical + overlapping scope modules
2. Same vertical + similar project rank
3. Same market segment + same billing type
4. Same platform + same timeline bracket

For each look-alike: account name, vertical, modules, project rank, account
tier, timeline, billing type, owner, close date, presales folder link (if
present), one-sentence "Why similar" note.

Do not show deal values, commission fields, or payment schedules.

If no look-alikes found, say so and suggest a manual Salesforce search by
`Account_Vertical__c`.

---

## Step 4 — Build the summary

Output a single structured markdown document. Use the template below. Omit
any section where no data is available. Never fabricate content — use
**NEEDS INPUT** for missing fields that matter.

---

### Output template

```
## Project Ramp: [Client Name]

**[Platform] Implementation** | Opp [Number] | CP: [Name] | DM: [Name] |
Start: [Date] | Go-Live: [Date] | [Account Tier] | [Billing Type] | [Total Hours] hrs

---

### Executive Summary
[3–5 sentences. What the company does, why they bought, what we're building,
and the one thing delivery needs to know going in.]

---

### Delivery Team

| Role | Person | Key RACI responsibilities |
|---|---|---|
| Delivery Manager | [Name] | Exec check-ins, escalations, staffing |
| Client Partner | [Name] | Commercial relationship, change orders |
| Project Manager | [Name] | Sessions scheduling, status reports, forecast, UAT kickoff |
| Lead Consultant | [Name] | Discovery, configuration, design sign-off |
| Consultant(s) | [Name(s)] | Process area configuration, UAT support |
| Business Analyst | [Name] | Process documentation, Jira stories, UAT scripts |
| Technical Consultant | [Name] | Integrations, custom dev, TDD |
| [Other roles as staffed] | | |

---

### Scope Highlights

**In:** [Concise list of modules and functional areas in scope. Group by
category: Core ERP, functional areas, integrations, custom development.]

**Out — hold the line:** [Key exclusions the team is most likely to be
asked about. Bullets only for the most scope-creep-prone items.]

**Watch:** [Any scope items that are partially defined, likely to generate
change orders, or flagged as gaps in the KT.]

---

### Key Risks

| Risk | Severity |
|---|---|
| [Risk description] | 🔴 High / 🟡 Medium / 🟢 Low |

[Include only risks that are actionable or that a new team member needs to
know on day one. Strip risks that have been resolved.]

---

### Stakeholders

| Name / Title | Role | Notes for delivery |
|---|---|---|
| [Name, Title] | [Decision Maker / Champion / Influencer / Blocker] | [What delivery needs to know — communication style, authority, sensitivities] |

[NEEDS INPUT for any stakeholder whose identity is unconfirmed.]

---

### Tech Landscape

**Replacing:** [Systems being decommissioned.]

**Integrations in scope:** [Partner systems — who owns each side of the
integration.]

**Data migration notes:** [Key risks, volume caps, client responsibilities.]

---

### Commercial Terms

[Billing type, milestones if fixed-bid, post go-live support window, UAT
window, payment terms, change order sensitivity. One short paragraph.]

---

### Project Status *(mid-engagement only)*

**Current phase:** [Phase name and week if known.]

**Open action items:**

| Item | Owner | Due | Status |
|---|---|---|---|

**Key decisions since kickoff:** [Bulleted list.]

**Upcoming milestones:** [Chronological list with dates if available.]

---

### Visual Assets & Process Docs

[Inventory of UPNs, flow diagrams, and visual assets found in the Drive
folder. Name, process area it covers, link. Do not attempt to summarize
diagram content — link directly.]

| Document | Process Area | Link |
|---|---|---|

---

### Look-Alike Projects

[2–4 comparable Plative engagements from Salesforce.]

| Client | Vertical | Modules | Rank | Timeline | Why Similar |
|---|---|---|---|---|---|

---

### Key Links

- [Signed SOW](url)
- [Project Drive Folder](url)
- [Salesforce Opportunity](url)
- [KT Document](url)
- [Resource Plan](url)
- [BRD](url)
- [Any other primary sources found]
```

---

## RACI reference (for annotating team section)

Plative's RACI defines accountability by role across the delivery lifecycle.
Use this when annotating the Delivery Team table — surface the 2–3 most
relevant responsibilities for each person's role, not the full matrix.

**Delivery Manager (DM):** Executive check-ins / Steering Committee (A,R);
escalation path; staffing approval.

**Client Partner (CP):** Commercial relationship; change order presentation
(I,C); onboarding call (A,R); executive check-in (C).

**Project Manager (PM):** Sessions scheduling (A,R); weekly status report
(A,R); forecast updates (A,R); UAT kickoff (A,R); project planning (A,R);
cutover plan (A); approve timesheets (A,R).

**Lead Consultant (LC):** Discovery sessions (A,R); process documentation /
Jira stories (A); design review (A); configure system (A); design sign-off
(A); post go-live support (R); training (A).

**Consultant (C):** Process documentation (R); configure system (R); UAT
support (R); training (R); post go-live support (R).

**Business Analyst (A):** Discovery sessions (I, bills at 1/2); Jira stories
(I); UAT test scripts (R); UAT support (R); training (R).

**Technical Consultant (TC):** Customization handoff (A); technical design
doc (R); integrations development (R); unit testing (R); data migration (R).

---

## What this skill does NOT do

- Does not create or modify a KT document — use `sales-to-delivery-kt` or
  `kt-doc-builder`.
- Does not score or grade the KT document.
- Does not send output to Slack or generate downloadable files.
- Does not attempt to summarize UPN or flow diagram content from extracted
  text — surfaces links instead.
- Does not open Granola or Fellow.ai without explicit user confirmation.
- Does not transcribe raw audio or video files.

---

## Example invocations

```
"Project Ramp — here's the KT doc for Riviera Partners."
"Prep for the Vector kickoff — attaching the KT and SOW."
"New developer joining the Atlas project midway through. Here's the Drive folder link and last three Granola calls."
"Load the KT for Tempest Energy — I have a call in an hour."
"Get me up to speed on Supreme. We're 3 months in — here's the KT and the last two status reports."
"We need to ramp Sarah onto the Fortis engagement. She's starting Monday."
```

---

## Reference files

- `references/section-map.md` — 10-section KT definitions and extraction
  patterns. Read at Step 2.
- `references/parsing-guide.md` — extraction from `.docx`, Drive files, and
  supplemental formats. Read at Step 2.
- `references/salesforce-lookups.md` — SOQL patterns for look-alike queries.
  Read at Step 3.
