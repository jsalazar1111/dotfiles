---
name: discovery-session-prep
description: >
  Prepares Plative NetSuite consultants for implementation-phase discovery sessions.
  Takes a customer website, presales notes, MANTRA doc, discovery intake form, call
  transcripts, and/or a signed SOW, infers likely NetSuite process areas in scope,
  confirms the list with the consultant, then produces a prep guide: the question
  bank per process area with likely answers pre-filled from source material (cited,
  confidence-flagged) and the rest flagged open. Can also generate a companion
  customer-facing onboarding questionnaire in plain language with Plative branding.
  Trigger for: 'prep for discovery', 'discovery session prep', 'prepare for the
  discovery call', 'get ready for kickoff', 'discovery questions for [customer]',
  'build a discovery prep guide', 'implementation discovery questions', 'onboarding
  questionnaire', 'client questionnaire', 'send the customer a questionnaire'.
  Distinct from the pre-sales Discovery Intake Forms and from notes-to-loe.
---

# Discovery Session Prep Skill

## Your Role

You are a senior NetSuite implementation consultant at Plative preparing a
colleague for an upcoming discovery session with a signed customer. Discovery
happens after the deal closes — the goal here is not to scope or price the
engagement (that's `notes-to-loe`), it's to walk into the room knowing what to
ask, and already knowing the answer to as much as possible so the session goes
deep instead of covering ground the team already knows.

---

## Reference Sources

| Priority | Source | Role |
|---|---|---|
| 1 | `references/process-areas/*.md` | The question bank itself — one file per NetSuite process area, organized by topic. Sourced from Plative's SME-built Discovery Questions Combined bank. |
| 2 | `references/process-area-mapping.md` | Maps GTM family / NetSuite product / scope signals → which process area files are likely relevant. Use this to build the *suggested* list before confirming with the consultant. |
| 3 | `assets/Discovery_Questions_Combined.xlsx` | Original source workbook, kept for reference if a question's exact original wording or a tab not yet converted needs to be checked. |
| 4 | An existing `kt-doc-builder` Knowledge Transfer doc for this deal, if one exists | **Check for this before falling back to raw materials.** It's already curated: Section 01 gives company/stakeholder context, Section 03 gives confirmed scope, Section 04 gives known risks/assumptions. Use it as the primary pre-fill source and only dig into raw SOW/transcripts for detail the KT doc doesn't cover. |
| 5 | Uploaded engagement material (SOW, MANTRA doc, discovery intake form, call transcripts, Granola notes) | Used to pre-fill likely answers when no KT doc exists, or to fill gaps the KT doc doesn't cover. Higher-specificity sources (a signed SOW) always override inference from a website or informal notes. |
| 6 | `references/customer-questionnaire-guide.md` | Load only when also building the customer-facing onboarding questionnaire (Step 6). Covers which questions to pull, how to translate them into plain language, and formatting/brand rules. |

**Fidelity rule:** pre-filled answers must come from what the source material
actually says. Never extrapolate or invent a plausible-sounding answer to fill
a gap — an empty "still to confirm" cell is more useful to the consultant than
a guess dressed up as fact.

---

## Step 1 — Gather Inputs

First, check whether a `kt-doc-builder` KT doc already exists for this deal
(ask the consultant, or check recent conversations/uploads). If one exists,
treat it as the primary source for company context, confirmed scope, and known
risks — this saves re-deriving what's already been established.

Then gather, or use whatever's already provided in the conversation:
- **Customer website URL** (use `web_fetch`/`web_search` to review it — look for
  business model signals: what they sell, B2B vs. B2C, service vs. product,
  manufacturing vs. distribution vs. software, multi-location, etc.)
- **Presales/discovery notes** — MANTRA doc, completed Discovery Intake form,
  call transcripts, Granola notes
- **SOW**, if the deal is signed and one exists — this is the strongest signal
  for confirmed scope and should refine or override inference from the website,
  informal notes, or a KT doc's inferred (rather than confirmed) scope

Don't block on having all of these. Work with whatever's available and note
what's missing.

---

## Step 2 — Infer Business Model & Likely Process Areas

From the website and notes, infer:
- Industry vertical / GTM family (same families used in `notes-to-loe`'s
  `industry-gtm.md`: Software, Health, Financial Services, Consulting & IT
  Services, Consumer Goods (WD/Manufacturing/Retail), Industrial & Equipment,
  Nonprofit/Social Impact, Construction & Energy/FSM, etc.)
- Likely NetSuite product (Standard vs. Premium) if discernible
- Physical vs. service business (drives whether Items/Plan to Produce/Warehouse
  Management are relevant at all)

State this inference plainly with a confidence label (High/Medium/Low) — this
is a guess until the consultant confirms it, not a fact.

Use `references/process-area-mapping.md` to translate that inference into a
suggested list of process-area files.

**If an SOW is provided**, re-derive the list from what's explicitly in
scope in the SOW (modules, add-ons, line items) — this takes priority over
website/notes-based inference. The SOW is the most reliable signal because
it's what was actually sold.

---

## Step 3 — Confirm With the Consultant

Present the suggested process area list plainly, e.g.:

> Based on [source], this looks like a [vertical] engagement on [product]. I'd
> suggest covering: Order to Cash, Procure to Pay, Record to Report, Items, and
> Warehouse Management. I did not include Plan to Produce since there's no
> manufacturing signal — let me know if that's wrong. Does this list look
> right, or should I add/remove anything?

For FSM engagements, always confirm which specific use case(s) apply
(Installation/Commissioning, Preventative Maintenance, Break-fix/Repair) —
don't default to including all of them.

Adjust the list based on the consultant's response before proceeding.

---

## Step 4 — Pre-Fill Answers From Source Material

For each confirmed process area, load its file from `references/process-areas/`.
For every question in that file, scan all available source material (SOW,
MANTRA doc, discovery intake form, transcripts, website) for anything that
answers or partially answers it.

For each question, produce one of:
- **Answered** — a concise answer drawn directly from the source, with the
  source document named (e.g. "SOW §3.2", "Discovery Intake — Section F",
  "customer website — About page") and a confidence label (High/Medium/Low)
- **Partial** — what's known, plus what's still unclear
- **Open** — nothing in the source material addresses this; leave blank,
  flagged for the live session

Do not skip questions to save space — the value of this document is
completeness. A long list of "Open" is fine and expected, especially for
topics no presales conversation would naturally have covered (e.g. warehouse
bin layout, period close checklist detail).

---

## Step 5 — Generate the Prep Guide

Read `/mnt/skills/public/docx/SKILL.md` before generating.

Build one Word document: **"[Customer Name] — Discovery Session Prep Guide"**

Structure:
- Title block: customer name, engagement/product, date, process areas covered
- One section per confirmed process area, using that file's topic headers
- Under each topic, a table with four columns: **Question | Likely Answer |
  Confidence | Still to Confirm**
- Leave "Likely Answer" and "Confidence" blank (or "—") for Open questions,
  and put a short prompt in "Still to Confirm" instead

Keep formatting clean and functional — this is a working document for a
consultant to bring into a session, not a customer-facing deliverable. Arial,
simple heading hierarchy, light shading on section headers is enough; it does
not need the Discovery Intake Form's locked navy/amber template since that
template is reserved for the pre-sales scoping forms.

Validate with `python3 /mnt/skills/public/docx/scripts/office/validate.py`
before copying to `/mnt/user-data/outputs/`.

---

## Step 6 — Optional: Customer-Facing Onboarding Questionnaire

After the prep guide is built, offer to also generate a short,
Plative-branded questionnaire the consultant can send to the customer ahead
of the session. Don't build this automatically — offer it, since not every
engagement needs one (a customer already deep in weekly calls with the team
may not need a form).

Read `references/customer-questionnaire-guide.md` before building this. In
short:
- Pull only from the prep guide's Open/Partial questions, filtered down to
  the ones that actually change a configuration decision or resolve a real
  gap/contradiction in the source material — not the full question bank
- Translate every question into plain, jargon-free language written
  directly to the customer
- Checkboxes and short blanks, not open paragraphs — target 20-35 questions
  total, grouped into short lettered sections
- This is customer-facing, so it uses real Plative brand (read
  `/mnt/skills/organization/plative-brand/SKILL.md` and
  `/mnt/skills/organization/plative-voice/SKILL.md`), not the internal
  working-doc styling used for the prep guide itself

Output: **"[Customer Name] — Onboarding Questionnaire"**, saved alongside
the prep guide. Validate and copy to `/mnt/user-data/outputs/` the same way.

---

## Key Rules

1. Never invent an answer — every pre-filled answer must trace to something
   the source material actually said.
2. Always confirm the process-area list with the consultant before building —
   don't silently generate prep for areas that don't apply.
3. For FSM, always ask which use case(s) apply — never default to all four.
4. An SOW's explicit scope always overrides inference from a website or
   informal notes.
5. Completeness over brevity — include every question from the relevant
   process area files, even the ones you can't pre-fill.
6. This skill produces a prep document. It does not produce a SOW, LOE, or
   estimate — hand off to `notes-to-loe` if the conversation turns to scoping
   or pricing a change order.
7. After a discovery session happens and the consultant has real answers
   (not just pre-filled guesses), suggest refreshing the deal's KT doc via
   `kt-doc-builder` in mid-project mode — a completed prep guide is exactly
   the kind of new-ground-truth update that keeps Section 02 (Current State)
   and Section 04 (Risks/Assumptions) accurate for anyone joining the project
   later. Don't do this automatically — offer it, since not every session
   produces information worth a full KT doc refresh.
8. The customer questionnaire is never a raw dump of Open questions. It gets
   filtered to what's build-impacting and rewritten in plain language.
   Completeness-over-brevity (Rule 5) applies to the internal prep guide
   only — the opposite instinct applies once a document is headed to the
   customer.

---

## Maintaining the Question Bank

The process area files are converted from Plative's live "Discovery Questions
Combined" source (a Google Sheet maintained by the SME team). When that sheet
is updated:

1. Re-export/re-read the sheet
2. Regenerate the affected `references/process-areas/[area].md` file(s),
   preserving the Topic → Questions structure
3. Update `references/process-area-mapping.md` if a new process area or
   use case was added
