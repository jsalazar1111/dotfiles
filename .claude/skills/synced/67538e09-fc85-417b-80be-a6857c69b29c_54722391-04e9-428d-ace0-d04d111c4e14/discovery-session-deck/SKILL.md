---
name: discovery-session-deck
description: >
  Generates slide-by-slide content for a Plative Salesforce (or NetSuite) discovery 
  session presentation, walks the user through an interactive accept / update / reject 
  review of each slide, then produces final structured markdown ready to paste into 
  Claude Design to create the finished deck. Use this skill whenever someone needs to 
  build, plan, draft, or prepare a discovery session deck. Trigger on phrases like 
  "build my discovery deck", "create session slides", "prep slides for my session with 
  [customer]", "I have a discovery session with [customer] and need a deck", "write up 
  the discovery presentation", or any request involving discovery session slides or 
  presentations. Also trigger when the user mentions a customer name alongside 
  "discovery", "session", or "slides" — even without the word "skill" or an explicit 
  request. Always use this skill before building any discovery presentation from scratch.
---

# Discovery Session Presentation Generator

This skill produces content for a Plative discovery session deck, slide by slide, then 
hands the result to Claude Design to create the finished visual presentation. The 
structure mirrors Plative's established discovery session format: dark hero title slide, 
project phase map, prior-session recap sequence, agenda item slides with confirm-today 
panels, sign-off checklist, action items, and a closing hero.

## How This Works

Four phases — complete them in order:

1. **Intake** — Collect session details (one prompt to the user, all questions at once)
2. **Slide plan** — Propose slide structure; user approves or modifies
3. **Slide review** — Walk through each slide; user accepts, updates, or rejects
4. **Output** — Produce final markdown + instructions for Claude Design

---

## Phase 1: Intake

Ask all of the following in a single message. If context from the current conversation 
already answers some of these, extract the answers rather than asking again.

- **Customer name** (e.g., "Harvest ETFs")
- **Salesforce product(s) in scope** (e.g., Sales Cloud, FSC, Service Cloud, CPQ)
- **Session number** (e.g., 04)
- **Session topic / title** (e.g., "Leadership Reporting & KPI Discovery")
- **Session goal** — one sentence on what this session accomplishes
- **Session type** — Internal working session, or external / customer-facing?
- **Year** (default to current year if omitted)
- **Prior sessions** — brief bullets on topics covered in sessions 1 through N-1
- **Open items** carried into this session from prior sessions (item + implication)
- **Today's agenda items** — list of topics or decisions the session will cover
- **Pre-work the customer needs to bring**
- **Plative recommendations to present** (if any)

---

## Phase 2: Slide Plan

Once you have the inputs, propose a numbered slide plan. Each line shows the slide 
number, type tag, and a one-line description of the content.

Use this standard structure, adapting to what the session actually needs:

```
01  [TITLE]           "[Session topic]" — hero title slide
02  [PHASE_MAP]       Where this session sits in the engagement
03  [CONTEXT]         Salesforce environments / build-test-deploy flow
04  [RECAP_CS]        Current state recap from prior sessions
05  [RECAP_FS]        Future state decisions from prior sessions
06  [RECAP_OPEN]      Open items carried into today
07  [RECAP_CONTEXT]   [Specific prior topic] — building blocks for today
08  [FRAMING]         The core question that frames today's session
09  [GOAL]            Session goal with stat callouts
10  [AGENDA]          Numbered agenda — N topics to cover
11  [PREWORK]         Pre-work the customer needs to bring
12  [DIVIDER]         Part 1 — [topic]
13  [AGENDA_ITEM]     [Agenda item 1]
14  [AGENDA_ITEM]     [Agenda item 2]
    ...
15  [DIVIDER]         Part 2 — [topic]
    ...
16  [SIGNOFF]         Decisions to confirm today
17  [NEXT_STEPS]      After this session
18  [ACTION_ITEMS]    Action items from this session
19  [CLOSING]         Closing hero slide
```

**Inclusion rules** — use judgment:
- Include `[CONTEXT]` only if Salesforce environments or a similar foundational concept 
  has not been covered in a prior session.
- Include `[RECAP_CONTEXT]` only if a specific prior topic needs dedicated framing to 
  set up today's work (e.g., cadence building blocks before a cadence design session).
- Include `[FRAMING]` only if the session hinges on a meaningful either/or or the 
  customer needs to pick a direction before the work can proceed.
- Add as many `[AGENDA_ITEM]` slides as there are agenda topics. Add `[DIVIDER]` 
  slides to group agenda items into logical parts (Part 1, Part 2, etc.).
- Always include `[ACTION_ITEMS]` — it is required for every session.

Present the plan as a clean numbered list, then ask:

> "Does this structure work? You can remove slides, add new ones, reorder, or swap 
> types — just tell me what to change. Once the plan looks right, say 'looks good' 
> and I'll generate the content."

---

## Phase 3: Slide Review

When the plan is approved, ask the user which review mode they prefer:

> "Ready to generate the content. Two options:
> - **Step-by-step** — I show each slide one at a time and you accept, update, or reject before I move on. Best if you want tight control.
> - **Quick mode** — I generate all slides at once and you review the full deck, then tell me what to change. Best for speed.
> Which do you prefer?"

**Step-by-step mode:** Generate one slide at a time using this format:

```
─────────────────────────────────────
SLIDE [N] of [TOTAL] · [TYPE TAG] · [TITLE]
─────────────────────────────────────
[slide content — use the Slide Type Reference below]
─────────────────────────────────────
→ Accept | Update (describe changes) | Reject (remove this slide)
```

Wait for the user's response before moving to the next slide. Apply any changes before 
continuing. If they say "reject," mark the slide as removed and move on.

**Quick mode:** Generate all slides at once in a single response, using the same 
per-slide format (separator, slide header, content). After the last slide, ask:

> "Full deck above. Tell me any slides to update, remove, or add — reference by slide 
> number or title. When you're happy, say 'done' and I'll produce the final markdown."

Apply all requested changes in one pass and show the revised slides. Repeat until the 
user says they're done.

---

## Slide Type Reference

Use this to generate content for each slide type. These are content structures, not 
visual instructions — Claude Design handles the visual rendering.

### [TITLE] — Hero title slide
```
SECTION_LABEL: [PRODUCT AREA] · DISCOVERY
CUSTOMER_LINE: [CUSTOMER] × PLATIVE
SESSION_NUMBER: [N]
SESSION_TITLE: [Topic]
DESCRIPTION: [1–2 sentences on what this session covers and its goal]
FOOTNOTE: [YEAR] · [INTERNAL / EXTERNAL] WORKING SESSION
```

### [PHASE_MAP] — Project phase map
```
SECTION_LABEL: WHERE THIS SESSION SITS
HEADLINE: [One declarative sentence on where we are in the engagement]
PHASES:
  - PHASE 01 · [Name] · [1-sentence description] · YOU ARE HERE / not here
  - PHASE 02 · [Name] · [1-sentence description]
  - PHASE 03 · [Name] · [1-sentence description]
  - PHASE 04 · [Name] · [1-sentence description]
```

### [CONTEXT] — Background context slide (e.g., Salesforce environments)
```
SECTION_LABEL: [TOPIC TAG — e.g., SALESFORCE ENVIRONMENTS]
HEADLINE: [What this explains — e.g., "How we build, test, and deploy"]
SUBHEAD: [One sentence framing why this matters]
STEPS:
  - STEP 1 · [Name] · [Role tag] · [Description]
  - STEP 2 · [Name] · [Role tag] · [Description]
  - STEP 3 · [Name] · [Role tag] · [Description]
CALLOUT_BAR: [THE KEY RULE / GATE] — [The rule in one sentence, bold key terms]
```

### [RECAP_CS] — Current state recap
```
SECTION_LABEL: RECAP · SESSIONS [X–Y] · CURRENT STATE
HEADLINE: [Where things stand today — declarative]
RECAP_COUNTER: RECAP 1 / [N]
CARDS (up to 6, in a 2×3 grid):
  - LABEL: [Topic] · CONTENT: [2–3 sentences on the current state of this area]
  - LABEL: [Topic] · CONTENT: [2–3 sentences]
  ...
```

### [RECAP_FS] — Future state / decisions recap
```
SECTION_LABEL: RECAP · SESSIONS [X–Y] · FUTURE STATE
HEADLINE: [The decisions that shape configuration]
RECAP_COUNTER: RECAP 2 / [N]
[If applicable: a process flow showing key stages, e.g., revised opportunity stages]
PROCESS_FLOW: [Stage 1] → [Stage 2] → [Stage 3] → ... (one line per stage with detail)
CARDS (2–3):
  - LABEL: [Decision area] · CONTENT: [What was decided and its configuration implication]
```

### [RECAP_OPEN] — Open items
```
SECTION_LABEL: RECAP · OPEN ITEMS INTO SESSION [N]
HEADLINE: What's still open — and why it matters for [today's topic]
RECAP_COUNTER: RECAP [N] / [TOTAL]
ITEMS:
  - ITEM: [Open item title]
    DETAIL: [One sentence of context]
    IMPLICATION: → [What it blocks, affects, or where it's addressed today]
```

### [RECAP_CONTEXT] — Building blocks / framing for today
```
SECTION_LABEL: RECAP · [TOPIC] — [STATUS TAG, e.g., NOT YET DETAILED]
HEADLINE: [Building blocks / framing for today's work]
RECAP_COUNTER: RECAP [N] / [TOTAL]
INTRO: [1–2 sentences on what was agreed and what's still to define]
CARDS (horizontal row — one per item):
  - NAME: [Item] · DESCRIPTION: [What it is or does]
CALLOUT_BAR: TO DEFINE TODAY → [What will be decided, cross-ref to agenda item number]
```

### [FRAMING] — Framing question
```
SECTION_LABEL: RECAP · THE QUESTION THAT FRAMES TODAY
HEADLINE: [The core question — vivid, specific, names the tension]
LEFT_PANEL:
  LABEL: [QUANTITATIVE / OPTION A label]
  TITLE: [Option A name]
  DESCRIPTION: [What this path addresses and what it implies]
RIGHT_PANEL:
  LABEL: [QUALITATIVE / OPTION B label]
  TITLE: [Option B name]
  DESCRIPTION: [What this path addresses and what it implies]
SEPARATOR: VS
CUSTOMER_INPUT_BAR: [What the customer confirmed or prioritized — direct language]
```

### [GOAL] — Session goal
```
SECTION_LABEL: SESSION GOAL
HEADLINE: [What this session accomplishes — action verb, bold and specific]
DESCRIPTION: [2–3 sentences on scope, what's included, what's not, dependencies]
STATS (2–3 callouts on the right side):
  - NUMBER: [N]  LABEL: [What it counts]  SUBLABEL: [Brief description]
NOTE: [Clarifying note — e.g., "Requirements, not sign-off"]
```

### [AGENDA] — Agenda
```
SECTION_LABEL: AGENDA · [N] [TOPICS / DECISIONS] TO CONFIRM
HEADLINE: How we'll spend the session
ITEMS (2-column numbered list):
  01  [Agenda item]
  02  [Agenda item]
  ...
```

### [PREWORK] — Pre-work
```
SECTION_LABEL: PRE-WORK · [CUSTOMER] TEAM
HEADLINE: What we need on the table to make these decisions
CARDS (2×2 numbered):
  - 01 · [Title] · [note: in session / prep needed] · [Description]
  - 02 · [Title] · [Description]
  - 03 · [Title] · [Description]
  - 04 · [Title] · [Description]
```

### [DIVIDER] — Section divider
```
BACKGROUND: Full-bleed landscape / mountain photo
PART_NUMBER: Part [N]
PART_TITLE: [Section title — bold, 3–5 words]
SUBTITLE: Agenda [X]–[Y] · [Brief description of what's covered in this section]
```

### [AGENDA_ITEM] — Agenda item slide
```
SECTION_LABEL: AGENDA [N] · [TOPIC TAG]
HEADLINE: [The central question or framing for this agenda item]
SUBHEAD: [1–2 sentences of context — what this covers and why it matters now]
LEFT_CONTENT:
  [Proposed options, framework, or approach. Use labeled sections, a 2×2 grid, a 
  process flow, or a simple card list depending on the content. Keep it scannable.]
RIGHT_PANEL (dark):
  TAG: CONFIRM TODAY
  QUESTIONS:
    - [Tight, specific question — one line]
    - [Question]
    - [Question]
    - [Question — 3 to 5 total]
```

If there is also a customer input or Plative recommendation to capture on this slide:
```
RIGHT_PANEL (dark):
  TAG: [CUSTOMER] INPUT  or  PLATIVE RECOMMENDATION
  SECTIONS:
    - SUBLABEL: [Sub-topic tag]
      CONTENT: [What the customer confirmed or Plative recommends — direct, one paragraph]
  ACTION_ITEM (if applicable): [One-line action item that came out of this discussion]
```

A slide can have both a CONFIRM TODAY panel and a CUSTOMER INPUT panel if the session 
input is already known from pre-work. Put CONFIRM TODAY at the top, CUSTOMER INPUT below.

### [SIGNOFF] — Sign-off checklist
```
SECTION_LABEL: SIGN-OFF · WHAT UNBLOCKS BUILD
HEADLINE: Decisions to confirm today
CHECKLIST (2-column, one item per decision):
  [ ] [Decision 1 — short, action-oriented]
  [ ] [Decision 2]
  [ ] [Decision 3]
  [ ] [Decision 4]
  [ ] [Decision 5]
  [ ] [Decision 6]
RECOMMENDATION_BAR: PLATIVE RECOMMENDATION — [Any standing recommendation to surface here]
```

The checklist items should map directly to the agenda items. Each item is a decision, 
not a task — "KPI list finalized" not "Review KPIs."

### [NEXT_STEPS] — Next steps
```
SECTION_LABEL: AFTER THIS SESSION
HEADLINE: Next steps
CARDS (3 columns):
  - TAG: PLATIVE
    TITLE: [What Plative does next — 3–4 words]
    DESCRIPTION: [1–2 sentences]
  - TAG: [CUSTOMER] TEAM
    TITLE: [What the customer does next]
    DESCRIPTION: [1–2 sentences]
  - TAG: FOLLOW-UPS
    TITLE: [Any outstanding threads or deferred items]
    DESCRIPTION: [1–2 sentences]
```

### [ACTION_ITEMS] — Action items from this session
```
SECTION_LABEL: ACTION ITEMS · SESSION [N]
HEADLINE: What happens next — by whom
TABLE:
  # | ACTION                        | OWNER        | TIMING
  1 | [Action item description]     | Plative      | [By next session / date / TBD]
  2 | [Action item]                 | [Customer]   | [Timing]
  ...
NOTE: [How items will be tracked — e.g., "Items tracked in Jira and confirmed in 
      post-session email."]
```

Populate action items from anything that surfaced during agenda item content generation 
(Plative recommendations to follow up on, customer commitments, deferred decisions). If 
specific items are not yet known, include placeholder rows with [TBD] and note that these 
are filled in during or immediately after the session.

### [CLOSING] — Closing hero slide
```
BACKGROUND: Dark gradient hero (same style as title slide)
LABEL: [CUSTOMER] × PLATIVE · [YEAR]
SESSION_TAG: DISCOVERY SESSION [N] · COMPLETE
HEADLINE: [2–3 line statement — e.g., "Requirements captured. Design review comes next."]
SUBTEXT: Thank you — questions and follow-ups welcome.
```

---

## Phase 4: Output

Once all slides are accepted, generate the final output as a single structured markdown 
document. Use this format for each slide:

```markdown
# [CUSTOMER] × PLATIVE · DISCOVERY SESSION [N] — [SESSION TITLE]

---

## SLIDE [N] · [TYPE TAG] · [TITLE]

[All content fields from the Slide Type Reference, using the field labels as written]

---
```

After the markdown, include the following block verbatim — replace bracketed values:

---

**Your deck content is ready. To finish it in Claude Design:**

1. Go to [claude.ai/design](https://claude.ai/design) and start a new project.
2. Paste this prompt, then paste the full markdown content below it:

> "Create a professional slide presentation using the content below. Style guide: dark 
> navy and crimson color palette with white text; Plative logo (lantern + wordmark) in 
> the corner of every slide. Title and closing slides use a dark gradient hero background. 
> Section divider slides use a full-bleed mountain landscape photo with text at bottom 
> left. Agenda item slides use a two-panel layout: content left, dark navy panel right 
> for confirm-today questions. All other slides use a white or light background with dark 
> text and card-style content blocks. Follow the slide structure and content exactly — do 
> not summarize, combine, or omit any slides."

3. Review Claude Design's output. Refine with follow-up prompts (e.g., "move the logo 
   to the top right," "make the agenda item headlines larger," "adjust the card spacing").
4. Export as PPTX, PDF, or share the internal URL with your team.

---

## Content principles

Apply these when writing slide content:

- **Section labels** are short all-caps context-setters — e.g., "RECAP · SESSIONS 1–3 · CURRENT STATE". They do not restate the headline.
- **Headlines** are declarative statements, not questions (except [FRAMING] slides). Lead with what is happening, what was decided, or what this session will accomplish.
- **CONFIRM TODAY** panels (right panel of [AGENDA_ITEM] slides) hold 3–5 tight, specific questions — one line each. These are the actual decisions the session needs to make.
- **CUSTOMER INPUT** panels show what the customer said, in direct language. Do not paraphrase into consultant-speak.
- **PLATIVE RECOMMENDATION** panels state the recommendation clearly, then in one sentence explain why. These are proposals for the customer to approve, not mandates.
- **Action items** must have a named owner (Plative or a named person / team at the customer) and a timing. Never leave them unowned.
- Active voice throughout. Sentences under 20 words. No filler transitions (moreover, furthermore, indeed). No banned words (leverage, robust, seamless, delve, etc.).
- Write at senior practitioner level — the audience is project team members and C-suite or IT leadership at the customer. Do not over-explain Salesforce basics.
