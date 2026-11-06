---
name: "discovery-questionnaire"
description: >
  Generates a tailored, partially pre-populated pre-discovery questionnaire for
  a signed Plative NetSuite engagement, to be sent to the customer between the
  onboarding call and project kickoff. Scope is driven entirely by the executed
  SOW line items. Questions known from presales are pre-filled for client
  validation; gaps the client must answer are left blank. Trigger for:
  "discovery questionnaire", "pre-discovery intake", "send the client a
  questionnaire", "build the questionnaire for [client]", "what do we still
  need to know before kickoff", "pre-kickoff client intake", or any request to
  prepare a client-facing information-gathering document for a signed
  NetSuite engagement. Also trigger when the KT doc has just been generated and
  the next logical step is preparing the client questionnaire.
  Do NOT use for pre-sales qualification — use notes-to-loe for that.
  Do NOT use for internal delivery team prep — use project-ramp for that.
---

# Discovery Questionnaire

Produces one deliverable: `[ClientName]_Discovery_Questionnaire.xlsx`, a
customer-facing workbook with one tab per in-scope process area, plus one
trailing internal-only tab. Each customer-facing tab has one question per
row, with these columns: #, Topic, Question, Plative's Understanding, Your
Answer / Correction. There is no internal-notes column on these tabs — see
"Internal Notes tab" below for where source citations and risk flags belong
instead.

The "Plative's Understanding" cell is either:

- **Pre-filled** — answer sourced from the KT doc or presales transcripts,
  in varied natural phrasing that ends with a short prompt to confirm or
  correct it (see Pre-population rules — never repeat the same template
  sentence on every row)
- **Blank** — answer unknown; the customer must provide it before discovery
  begins

The goal is to arrive at the first discovery session already knowing most of
what would otherwise take the first hour to establish. If the client fills this
out, discovery sessions go faster, go deeper, and produce fewer surprises.

Read this entire file before starting. The workflow is a strict sequence and
the quality of the output depends on completing each step in order.

---

## Design principles

**The SOW is the only scope filter.** Every question in this document maps to
a line item in the executed SOW. If it is not in the SOW, the question does
not appear. Do not generate questions for modules, process areas, or add-ons
that are not explicitly contracted. Do not use the bundle type as a proxy —
read the actual SOW line items.

**Never ask what you already know.** The KT doc and presales transcripts
contain answers. Every answer that exists in those sources gets pre-filled with
a validation prompt. Only genuinely unknown information goes to the client as a
blank. Sending a blank questionnaire is a failure mode — it signals we did not
do our homework and forces the client to answer questions already covered in
discovery.

**Never fabricate a pre-filled answer.** If the source material is ambiguous,
partial, or contradictory, leave the field blank rather than guessing. A wrong
pre-filled answer is worse than a blank — delivery may act on it.

**Client language, not Plative language.** Questions use plain business
language. NetSuite module names and Plative delivery terminology do not appear
in questions. The client did not buy "Procure to Pay (Product)" — they bought
the ability to pay their vendors. Write accordingly.

**Flag conflicts visibly.** Where the SOW and transcripts disagree on scope,
flag the discrepancy in a note column rather than resolving it silently. Only
a human can decide which is authoritative.

**One tab per process area.** Each tab covers one SOW line item or logical
process group. Tabs that are not in scope do not exist in the output. A client
receiving a 12-tab workbook with 3 blank tabs will fill in the wrong places.

---

## Source hierarchy

Read sources in this order. Later sources enrich but never replace earlier ones.

| Priority | Source | What it contributes |
|---|---|---|
| 1 | Executed SOW | Defines which tabs exist. Authoritative. |
| 2 | KT document | Pre-fills most answers. Primary pre-population engine. |
| 3 | Presales transcripts | Fills gaps the KT doc missed. Secondary pre-population. |
| 4 | Salesforce Opportunity | Stakeholders, timeline, billing type, line items. |
| 5 | Question bank (references/) | The pool of questions per process area. |

If no KT document exists, proceed from the SOW and transcripts directly and
note in the cover tab that the KT was not available — answers will be sparser.

---

## Runtime flow

### Step 1 — Identify the client and pull the SOW

Ask for the client name if not provided. Then:

1. Search Salesforce using the SOSL pattern in
   `references/salesforce-fields.md`. Confirm the correct Opportunity before
   pulling anything else.
2. Pull `OpportunityLineItem` records — these are the SOW line items.
3. Pull `SOW_POW_CO_Link__c` and read the executed SOW from Drive.
4. The SOW line items define the tab structure. Build the tab list now and
   present it to the user for confirmation before proceeding:

> "I've found the executed SOW for [Client]. It includes the following
> in-scope process areas — I'll build one questionnaire tab for each.
> [List tabs]. Does this look right before I proceed?"

Wait for confirmation. If the user corrects the scope, update the tab list
and proceed.

**If no SOW is available:** ask the user to provide it or paste the scope
line items. Do not proceed without a scope anchor. The bundle type alone is
not sufficient — fall back to it only if the user explicitly cannot provide
the SOW, and flag the output as provisional.

### Step 2 — Read the KT document

Check for a KT document in the following order:

1. Uploaded in this conversation.
2. Linked in `PSA_Google_Folder_Link__c` on the Opportunity.
3. Ask the user: "Do you have the KT document for this engagement? I'll use
   it to pre-populate answers so the client doesn't have to repeat what was
   already covered in discovery."

If no KT exists, note this and proceed — the questionnaire will have more
blanks, which is expected for deals that skipped the KT step.

Read the KT against the 10 canonical sections:
- Executive Summary / deal context
- Client profile
- Scope and exclusions
- Technical landscape / current systems
- Fit-gap
- Stakeholders
- Risks
- Licensing and commercial terms
- Source index

Extract every factual answer that maps to a question in `references/question-bank.md`.
Tag each extracted answer with its source (KT section + any transcript
reference) for the note column.

### Step 3 — Read presales transcripts

If Granola is connected, confirm before pulling:
> "I see Granola connected — should I pull the [client] presales meetings
> to fill in any remaining gaps?"

If Fellow.ai is connected, do the same.

Pull transcripts chronologically. Apply the supersede principle: later
statements overwrite earlier ones. Extract answers to any questions still blank
after Step 2.

### Step 4 — Gap check

Before generating the workbook, show the user what is pre-filled vs. blank:

> "Here's what I have for [Client]:
> — [N] questions pre-filled from the KT doc and transcripts
> — [N] questions still blank — the client will need to answer these
> — [N] questions flagged (SOW vs. transcript discrepancy)
>
> Anything you can fill in now before I generate? Or should I proceed?"

Wait for the user's response. Accept any additional answers inline and fold
them in before generating. Keep the final pre-filled/blank counts from this
step — they feed directly into the Cover tab's completion summary in Step 5.

### Step 5 — Generate the workbook

Build `[ClientName]_Discovery_Questionnaire.xlsx` using the xlsx skill.
Structure: one tab per in-scope process area, a Cover tab (with the
completion summary from Step 4), and the trailing `Internal Notes — DO NOT
SEND` tab described above.

See `references/output-template.md` for the exact column layout and
formatting rules (note: this reference file is not currently present in the
skill folder — the column layout and formatting rules live directly in this
SKILL.md until it's rebuilt).

---

## Tab structure

Tabs are created only for SOW line items that are in scope. Use the mapping
in `references/sow-to-tab-map.md` to translate SOW line item names to tab
names and question sets.

**Always-present tabs** (appear in every engagement):
- Cover
- Company Structure
- Financial Management

**Conditional tabs** (appear only if the SOW line item is present):

| SOW Line Item | Tab Name | Question Source |
|---|---|---|
| Order to Cash (Product) | Order to Cash — Products | question-bank.md §OTC-P |
| Order to Cash (SW) | Order to Cash — Software & Services | question-bank.md §OTC-SW |
| Procure to Pay (Product) | Procure to Pay | question-bank.md §P2P |
| Procure to Pay (SW) | Procure to Pay | question-bank.md §P2P-SW |
| Revenue Management (ARM) | Revenue Recognition | question-bank.md §ARM |
| Plan to Produce | Manufacturing & Production | question-bank.md §MFG |
| Advanced Inventory / WMS | Warehouse & Inventory | question-bank.md §WMS |
| Fixed Assets | Fixed Assets | question-bank.md §FA |
| NetSuite FSM | Field Service | question-bank.md §FSM |
| SuiteProjects / PSA | Projects & Resources | question-bank.md §PSA |
| SuiteBilling | Subscription Billing | question-bank.md §BILL |
| Grant Management | Grant Management | question-bank.md §GRANT |
| Plative IP — AIA Billing | AIA Billing & Job Costing | question-bank.md §CE |
| Plative IP — Pay When Paid | Subcontractors & Pay-When-Paid | question-bank.md §CE |
| Custom Integration (per integration) | Integrations | question-bank.md §INT |
| Electronic Bank Payments | Banking & Payments | question-bank.md §EBP |
| Avalara | Tax Automation | question-bank.md §TAX |
| NetSuite NSPB | Planning & Budgeting | question-bank.md §NSPB |
| Multi-Currency | Multi-Currency | question-bank.md §MC |
| Data Loading | Data Migration | question-bank.md §DATA |

If a SOW line item does not appear in this table, use the Discovery Questions
Combined file (`references/question-bank.md §GENERAL`) for a best-fit match
and note the approximation.

---

## Pre-population rules

For each question in each tab:

1. Search the KT doc and transcripts for an answer.
2. If found: populate the "Plative's Understanding" column with the answer,
   closing with a short prompt to confirm or correct it. **Do not open every
   cell with the same template sentence** ("We understand that..."). Rotate
   across natural phrasings, for example:
   - "[Answer]. Let us know if that's changed."
   - "Based on our conversations, [answer]. Please confirm or correct."
   - "[Answer] — flag anything that's off."
   - "Our understanding: [answer]. Correct us if needed."
   Read the two or three rows before and after the one you're writing so the
   phrasing doesn't fall into its own repeating pattern either.
3. If not found: leave the "Plative's Understanding" column blank.
4. If conflicting answers exist across sources: populate with both and flag:
   `Note: SOW states [X]; discovery call on [date] suggested [Y]. Please
   clarify which is correct.`
5. Never leave a "Question" cell blank — every row must have a question.
6. Never invent an answer for a blank "Plative's Understanding" cell.
7. **Strip Plative and NetSuite delivery jargon before it reaches a
   customer-facing cell** — this applies to both the "Question" and
   "Plative's Understanding" columns. Check every cell against the banned
   terms below (non-exhaustive; apply the same logic to any other module
   name, SuiteApp name, or delivery-team shorthand that shows up in source
   material):

   | Don't write | Write instead |
   |---|---|
   | ARM / Revenue Rules, Plans, Elements, Arrangements | how revenue gets recognized / booked |
   | SuiteProjects / PSA | project tracking |
   | MuleSoft / MuleSoft CloudHub | the integration platform |
   | NACHA / CPA-005 file | the standard payment file format your bank uses |
   | Multi-Book Accounting | reporting under more than one accounting standard |
   | 3-way match / 3/2-way matching | matching the purchase order, receipt, and bill before paying |
   | NSPB | the planning and budgeting tool |
   | Electronic Bank Payments (SuiteApp) | electronic vendor payments |
   | Bundle / bundle type | (omit — never reference internally as a scope proxy, per Design principles) |

   A SOW section citation like "SOW §19" belongs in the Internal Notes tab,
   never in a customer-facing cell.

---

## Cover tab

The Cover tab is the first thing the client sees. It sets expectations and
makes the questionnaire easy to use.

Contents:
- Client name and project name
- Prepared by: [CP name] and the Plative delivery team
- Date prepared
- Instructions: plain language, 3-4 sentences max
  - What this is and why we're sending it
  - What the client needs to do (review, correct, fill blanks)
  - When we need it back (before kickoff if possible; before first discovery
    session at the latest)
  - Who to contact with questions
- **Completion summary**: total questions, how many are pre-filled, how many
  are blank, and a rough time estimate (roughly 1 minute per blank question
  is a reasonable default; adjust if a tab is unusually dense). Example:
  "127 questions total — 84 are already filled in for you to confirm, 43
  are blank and need your input. Filling in the blanks should take about
  45 minutes." Pull these counts from the same tally used in Step 4 (Gap
  check) rather than recounting by hand.
- Tab index: one line per tab with a brief description of what it covers
- Note on pre-filled answers: "We've filled in what we already know from our
  discovery conversations. Please correct anything that's wrong — it's more
  helpful than confirming what's right."

Write the cover in plain, direct language. No consulting tone. No jargon.
The person reading this is likely a finance or operations leader, not a
technology buyer.

---

## Internal Notes tab

Source citations, risk flags, and pattern references (SOW section numbers,
other-customer comparisons, change-order bait, anything that would be
awkward or a confidentiality problem if the customer read it) never appear
as a column on a customer-facing tab. They go on a single trailing tab
instead:

- **Tab name**: `Internal Notes — DO NOT SEND`
- **Tab color**: red, so it's visually distinct in the tab bar
- **Row 1**: a banner cell reading "INTERNAL ONLY. Delete this tab before
  sending the workbook to the customer." spanning the header row.
- **Columns**: Tab, Question #, Source / Citation, Note (the same content
  that used to live in the per-row "Notes (Internal)" column, just
  consolidated onto this one tab instead of spread across every other tab).

This preserves the traceability and pattern-matching value the notes provide
for the CP and delivery team, without putting a single one of those notes on
a tab the customer opens. Treat leaving this tab in a workbook that actually
gets sent as a confidentiality incident, not a formatting nitpick.

---

## Quality checklist

Run before presenting the file:

- [ ] Every tab corresponds to an actual SOW line item — no phantom tabs.
- [ ] No tab exists for an out-of-scope module.
- [ ] No customer-facing tab has a "Notes (Internal)" column or any other
      cell containing a SOW citation, risk flag, or other-customer reference
      — that content lives only on the `Internal Notes — DO NOT SEND` tab.
- [ ] The `Internal Notes — DO NOT SEND` tab exists, is colored red, and
      carries the banner row.
- [ ] Every pre-filled answer cites its source on the Internal Notes tab
      (KT section or transcript date), not on the customer-facing tab.
- [ ] No pre-filled answer was invented — each traces to source material.
- [ ] Pre-filled answers use varied phrasing — no more than two consecutive
      rows open with the same sentence structure.
- [ ] All SOW-vs-transcript conflicts are flagged, not silently resolved.
- [ ] No term from the banned-jargon table in Pre-population rules appears
      in a customer-facing "Question" or "Plative's Understanding" cell.
- [ ] Cover tab instructions are written in plain customer language and
      include the completion summary (total / pre-filled / blank / time
      estimate).
- [ ] Filename is exactly `[ClientName]_Discovery_Questionnaire.xlsx`.
- [ ] Data Migration tab includes volume fields for every object in the SOW.
- [ ] Integration tab has one row per named integration in the SOW.

---

## Relationship to other skills

| Skill | Relationship |
|---|---|
| `sales-to-delivery-kt` | Runs before this skill. Its output is the primary pre-population source. If the KT was just generated, the questionnaire should be offered as the immediate next step. |
| `project-ramp` | Runs after this skill. Uses the completed questionnaire (once returned by the client) as a supplemental source alongside the KT doc. |
| `notes-to-loe` | Pre-sales only. Drives scope decisions before the SOW is signed. No overlap with this skill. |
| `discovery-session-prep` | Runs after the questionnaire is returned. Uses the client's answers to prepare the discovery session agenda and question sequence. |

The recommended workflow is:

```
notes-to-loe (pre-sales scoping)
    ↓
[SOW signed]
    ↓
sales-to-delivery-kt (internal handoff doc)
    ↓
discovery-questionnaire (this skill — client-facing intake)
    ↓
[client returns completed questionnaire]
    ↓
project-ramp (delivery team briefing, enriched with client answers)
    ↓
discovery-session-prep (session agendas built from answers)
```

---

## What this skill does NOT do

- Does not create or modify the KT document — use `sales-to-delivery-kt`.
- Does not prepare discovery session agendas — use `discovery-session-prep`.
- Does not scope the deal or estimate hours — use `notes-to-loe`.
- Does not send the questionnaire to the client — present the file and let
  the CP send it through their normal channel.
- Does not generate questions for out-of-scope modules.
- Does not work from a bundle type alone — always requires the SOW.

---

## Reference files

- `references/salesforce-fields.md` — SOSL/SOQL patterns and field mappings.
  Read at Step 1. Shared with `sales-to-delivery-kt`.
- `references/sow-to-tab-map.md` — maps SOW line item names to tab names
  and question set codes. Read at Step 1 after confirming the Opportunity.
- `references/question-bank.md` — full question inventory by process area,
  organized by section code. Read at Step 5 when building each tab.
- `references/output-template.md` — exact column layout, formatting rules,
  and Excel construction instructions. Read at Step 5.
- `references/pre-population-sources.md` — shared source-gathering logic used
  by both this skill and `sales-to-delivery-kt`. Read at Steps 2-3.
