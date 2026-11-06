---
name: win-story
description: >
  Generates Plative NetSuite win story deliverables from proposal decks, SOWs, Spotlight sheets, or pasted notes.
  Five outputs: (A) email for NetSuite AEs, (B) Joint Win .pptx, (C) Spotlight Award submission, (D) internal Deal
  Review debrief, (F) enablement deck panel. Trigger for: "win story", "customer win", "joint win", "spotlight
  award", "spotlight submission", "NSCorp submission", closed/won deal summary requests, proposal decks marked as
  won or live. Also trigger for: "deal review", "internal debrief", "debrief this deal", "how did this deal go" —
  internal deal summaries. Also trigger for: "enablement slide", "deal panel", "add to enablement deck",
  "vertical enablement", "populate the panel" — injecting deal snapshots into vertical enablement decks.
  Use the plative-voice skill for all copy.
---

# Win Story Skill

Generates up to five deliverables from a closed/won Plative NetSuite deal:

1. **Written email summary** — for NetSuite AEs and regional sales leadership
2. **Win story slide** (.pptx) — single slide matching the Joint Win template
3. **Spotlight Award submission** — completed Q&A for NSCorp submission
4. **Deal Review** — internal debrief for the Plative team; not for external sharing
5. **Enablement deck panel** — right-side deal snapshot injected into a vertical enablement .pptx

**Always ask which output(s) the user wants before doing any work.** Use this exact prompt:

> "Which output(s) do you need?
> A. Email summary (for NetSuite AEs)
> B. Joint Win slide (.pptx)
> C. Spotlight Award submission
> D. Deal Review (internal debrief)
> E. All of the above
> F. Enablement deck panel (right-side deal snapshot for vertical enablement decks)
>
> Also — are you sending multiple win stories in one email, or just this one?"

Wait for the answer before proceeding. Do not generate any output until the user confirms their selection.

---

## Inputs

Accept any combination of:
- Google Slides proposal deck URL → use `Google Drive:read_file_content` with the file ID from the URL
- Google Sheets Spotlight tracker URL → read directly from the document content provided in context
- Uploaded .pptx proposal deck → use the `pptx` or `file-reading` skill
- SOW (.docx or pasted text)
- Pasted notes or inline context

Extract only deal-specific fields. Skip methodology slides, boilerplate Plative copy, and PM framework slides.

---

## Step 1: Extract Deal Data

Pull these fields from the source. Mark missing fields `TBD` and list them for the user at the end.

| Field | Where to find it |
|---|---|
| **Company name** | Title slide, exec summary, or Spotlight sheet |
| **Industry / vertical** | Company description, synopsis, or Spotlight "By Industry" field |
| **HQ location** | Company synopsis |
| **Annual revenue** | Spotlight sheet or proposal exec summary |
| **Founded** | Spotlight sheet or company overview |
| **Main lines of business** | Spotlight sheet or company overview section |
| **Systems replaced** | Current state diagram, "What We've Heard" challenges, or Spotlight field |
| **Systems integrated** | Future state diagram, integrations section, or Spotlight field |
| **Key challenges** | "What We've Heard" table, exec summary pain points, or Spotlight field |
| **NetSuite modules deployed** | Solution overview, future state diagram, LOE table, or Spotlight field |
| **SuiteApps** | Spotlight sheet or LOE |
| **Additional tech stack** | Spotlight sheet |
| **Plative IP included** | LOE lines labeled "Plative IP" or Spotlight "top partner customizations" field |
| **IP benefits** | Spotlight "benefits from partner customizations" field |
| **Project ACV** | Investment summary or LOE total — use discounted rate if both are present |
| **Project duration / go-live date** | Timeline slide or Spotlight field |
| **Implementation narrative** | Spotlight "How did implementation go?" field |
| **Customer benefits** | Spotlight "What benefits has the customer seen?" field |
| **What's next** | Spotlight "What's next?" field |
| **PE / VC backing** | Spotlight field |
| **Association membership** | Spotlight field |
| **Competitors in deal** | Spotlight field |
| **Why NetSuite over competitors** | Spotlight field or exec summary "NetSuite Solution" section |
| **NetSuite AI usage** | Spotlight field (NSAW, NSPB, Text Enhance, etc.) |
| **Customer quote** | Spotlight field or any testimonial block in the proposal |
| **Spotlight Award category** | Spotlight sheet "Choose 1 of the following" section |
| **SuiteSuccess leveraged** | Spotlight field |
| **Is customer referenceable** | Spotlight field |
| **NSCorp Customer ID** | Spotlight field |
| **Implementation Record Number** | Spotlight field |

---

## Output A: Written Email Summary

**Audience:** NetSuite AEs and regional sales managers, receiving multiple win stories in one email.
Skimmable in under 30 seconds. Keyword-dense so reps can find it later by searching for industry, module, or company name.

### Format

```
[COMPANY NAME] | [INDUSTRY] | [MICROVERTICAL] | [LOCATION]

[1-sentence company description — plain, specific, no jargon]

REPLACED:
- [System name]
- [System name]

INTEGRATED:
- [System + 3-word purpose]

CHALLENGES:
- [5–8 word outcome-focused challenge]
- [5–8 word outcome-focused challenge]
- [5–8 word outcome-focused challenge]

NETSUITE MODULES:
[Comma-separated — exact NetSuite product names]

PLATIVE IP:
[Comma-separated — exact Plative IP names, or omit section if none]

WHY NETSUITE:
- [6–10 word outcome bullet]
- [6–10 word outcome bullet]

WHY PLATIVE:
- [6–10 word bullet — specific differentiator, not generic consulting language]
- [6–10 word bullet]

AI SOLUTIONS & CONSIDERATIONS:
- [Current: describe any NetSuite AI products live — NSAW, NSPB, Text Enhance, Claude connector, etc.]
- [Pipeline: describe any AI expansions planned or in discussion — if none, write "No current AI deployment — potential fit for [NSAW / NSPB] based on [specific signal from the deal]"]

ACV: $[amount] | TIMELINE: [X weeks/months]

"[Customer quote — 1–2 sentences, attributed to Name, Title]"
```

### Field guidance: INDUSTRY vs. MICROVERTICAL

**INDUSTRY** is the broad GTM bucket: Software & Business Services, Construction & Energy, Products, Consumer Services, Health & Hospitality, Nonprofit.

**MICROVERTICAL** is the specific segment that makes the deal searchable and relevant to a rep working a similar account. Be specific:
- Not "Software" → "SaaS / Subscription Billing"
- Not "Manufacturing" → "Swine Genetics / Agriculture"
- Not "Energy" → "Natural Gas Compression / Field Service"
- Not "Media" → "B2B Life Sciences Media"
- Not "Technology" → "Conversational AI / PropTech"

If the source doesn't explicitly state a microvertical, infer it from the company description and main lines of business.

### Field guidance: AI SOLUTIONS & CONSIDERATIONS

This section exists so NetSuite AEs can immediately spot upsell potential and connect the right product team. Always include it, even when no AI is live. Two scenarios:

**AI is live:** Name the specific product and describe the use case in one line.
- "NSAW: Automated NRR, churn, and bookings-vs-billings dashboards replacing manual Excel ETL"
- "NSPB: Class-level FY26 forecasting across 20 subsidiaries, replaces 30-hour manual close"
- "Claude MCP Connector: Natural language queries against NetSuite financial data"

**No AI deployed yet:** Name the most likely fit and the signal that supports it.
- "No current AI deployment — strong NSAW candidate based on 15,000+ monthly invoices and manual Excel NRR reporting"
- "No current AI deployment — NSPB fit given multi-entity consolidation and manual budgeting process"
- "No current AI deployment — Text Enhance relevant as team scales to 50+ NetSuite users"

Never leave this section blank. If there is genuinely no signal for any AI product, write: "No current AI deployment identified — revisit at QBR."

### Copy rules
- Sentence case, no trailing periods on bullets
- Exact product names: NetSuite FSM, SuiteProjects, Plative Billing Engine, NSAW, NSPB, etc.
- No em dashes, no: leverage, seamless, transformative, robust, game-changer, unlock, delve
- "Customer" not "client"
- ACV: use discounted total if list and discounted are both present
- Omit "PLATIVE IP:" section entirely if no IP was deployed
- When batching multiple companies in one email: stack blocks separated by `---`, no email wrapper

---

## Output B: Win Story Slide

Single .pptx matching the official Plative Customer Win Story infographic template.

### Layout overview

Portrait-ratio slide (`6.07" × 10.41"`), seven vertical zones top-to-bottom:

| Zone | Description |
|---|---|
| 1 | **Dark hero header** — navy `#14182E`, Plative logo, section label in crimson, headline (key words highlighted crimson), subhead, customer logo placeholder |
| 2 | **Stat bar** — 5 tiles (INDUSTRY, HEADQUARTERS, FOUNDED, EMPLOYEES, EXISTING ERP), alternating white/off-white |
| 3 | **Solution Design At a Glance** — white card. **Preferred:** screenshot of the actual architecture/landscape diagram from the source deck, injected as an image. Fallback: generated 3-box SOURCE → CORE → OUTPUT placeholder if no diagram found. |
| 4 | **Why panels + left column** — 3 right-side stacked cards (WHY NETSUITE, WHY PLATIVE, AI SOLUTIONS — AI panel in navy), left column for custom visual or key stats |
| 5 | **Quote strip** — white bar, crimson left accent, italicized quote, right-aligned attribution |
| 6 | **Bottom 3 panels** — NETSUITE SOLUTION (modules + integrations as pills), IMPLEMENTATION (timeline, methodology, approach), THE TEAMS (dark navy) |
| 7 | **Footer** — off-white, Plative logo dark, contact, confidentiality note |

### Key design tokens

```
Slide dimensions: 6.07" × 10.41" (portrait)
Layout name:      PLATIVE_WIN

Colors (pptxgenjs — no # prefix):
  navy:       14182E   <- dark hero bg
  navyLight:  262A42   <- bottom team panel, AI panel
  crimson:    E14136   <- section labels, accents, highlights
  white:      FFFFFF
  offWhite:   F5F6FA
  lightGray:  E8E9EC
  midGray:    B0B3BE   <- captions, sub-labels
  darkText:   1C1C2E
  tagBg:      EAECF5   <- default pill background
  tagText:    44506B   <- default pill foreground
  tealPill:   E8F5F5 / 0D7A7F  <- integration pills

Brand assets:
  LOGO_LIGHT:  /mnt/skills/user/slide-templates/assets/plative-logo-light.png
  LOGO_DARK:   /mnt/skills/user/slide-templates/assets/plative-logo-dark.png
  LOGO_ASPECT: 3.374
```

### Data object — populate with extracted deal fields

```javascript
const deal = {
  label:            'WIN STORY · [INDUSTRY LABEL]',
  headline:         '[Headline sentence]',
  headlineEmphasis: ['words', 'to highlight in crimson'],
  subhead:          '[2-3 sentence summary]',
  stats: [
    { label: 'INDUSTRY',     value: '[broad]',    sub: '[microvertical]' },
    { label: 'HEADQUARTERS', value: '[City, ST]', sub: null },
    { label: 'FOUNDED',      value: '[year]',     sub: null },
    { label: 'EMPLOYEES',    value: '[#]',         sub: null },
    { label: 'EXISTING ERP', value: '[system]',   sub: '[+ other systems]' },
  ],
  whyNetSuite:  '[2-4 sentence paragraph]',
  whyPlative:   '[2-4 sentence paragraph]',
  aiNote:       '[AI products live or pipeline fit]',
  quote:        '[Customer quote text without surrounding quotes]',
  quoteAttrib:  '[Title]',
  quoteCompany: '[COMPANY NAME IN CAPS]',
  edition:      '[SuiteSuccess edition name]',
  modules:      ['Module 1', 'Module 2'],
  integrations: ['System 1', 'System 2'],
  timeline:     '[X months]',
  methodology:  '[SuiteSuccess + method]',
  approach:     '[1-2 sentence deployment narrative]',
  nsAE:         'Account Executive',
  platLead:     '[Engagement Manager name/role]',
  platDeliv:    '[Solution Architect · Senior PM]',
  companySlug:  '[CompanyNameNoSpaces]',
};
```

### Source material — Solution Design At a Glance

Before writing the deal object, check the source deck for a system landscape or architecture diagram. This is the most important visual element in the slide.

**If the proposal/deck contains a current/target state diagram, architecture diagram, or solution landscape slide:**
1. Take a screenshot of that slide using the PPTX thumbnail workflow:
   ```bash
   python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf [source.pptx]
   pdftoppm -jpeg -r 200 [source.pdf] source_slide
   ```
2. `view` each slide image to find the diagram slide
3. Once identified, crop or use that image as `solutionDiagramPath` in the deal object (save to `/home/claude/solution_diagram.jpg`)
4. Inject it into Zone 3 using `slide.addImage()` — replace the generated SOURCE→CORE→OUTPUT placeholder boxes with the actual diagram image

If no diagram exists in the source, keep the generated placeholder boxes.

### Build instructions

Copy the reference script, inject the deal object, then run:

```bash
cp /mnt/skills/user/win-story/scripts/generate_win_story.js /home/claude/
# Edit the deal object at the top of the file with extracted values
cd /home/claude && npm install pptxgenjs 2>/dev/null
node generate_win_story.js
```

Always QA after generating:

```bash
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf /mnt/user-data/outputs/[Company]_WinStory.pptx
pdftoppm -jpeg -r 150 /mnt/user-data/outputs/[Company]_WinStory.pdf slide
```

Then `view` the slide image. Fix text overflow, missing pills, or misaligned zones before presenting to the user.

Reference script: `/mnt/skills/user/win-story/scripts/generate_win_story.js`
Output path: `/mnt/user-data/outputs/[CompanySlug]_WinStory.pptx`

---

## Output C: Spotlight Award Submission

Complete the NSCorp Spotlight Award Q&A form fields from the extracted deal data.
Natalie Evans (nevans@plative.com) is always the submitter. Partner company is always "Plative Inc."

**Category selection:** Identify from the Spotlight tracker "By Industry / Product / Competitor / PE / Association" fields. If not pre-filled, infer from deal data:
- PE/VC backed → "By Private Equity"
- Replaced a named competitor (Intacct, Microsoft, QuickBooks, Sage) → "By Competitor" (name the switch)
- Specific NetSuite product spotlight (NSAW, FSM, Planning & Budgeting) → "By Product"
- Industry is notable (AI, Energy, Agriculture, Media) → "By Industry"

**Format the submission as a filled Q&A block:**

```
SPOTLIGHT AWARD SUBMISSION
Category: [By Industry / Product / Competitor / PE / Association — specify subcategory]

Partner Company Name: Plative Inc.
Submitter: Natalie Evans | nevans@plative.com
NSCorp Customer ID: [from tracker or TBD]
Implementation Record Number: [from tracker or TBD]

Customer Name: [name]
Customer Website: [url]
Customer Annual Revenue: [amount]
Is customer live: Yes
Is customer referenceable: Yes
PE/VC backed: [Yes — [firm name] / No]
Association member: [Yes — [name] / No]
Gone through M&A: [Yes / No]
Completed within last 18 months: Yes
Public company: [Yes / No]
Founded: [year]

Main lines of business:
[2–3 sentences]

Top challenges prior to NetSuite:
[3–5 bullet points, outcome-focused]

Previous technology:
[comma-separated list]

Competitors in deal:
[list]

Why NetSuite over competitors:
[3–5 bullet points]

NetSuite modules:
[list]

SuiteApps:
[list or N/A]

Additional tech stack:
[list or N/A]

NetSuite AI capabilities:
[describe usage or N/A]

Top partner customizations/IP:
[list with 1-line benefit each]

Benefits from partner customizations/IP:
[3–5 bullets]

How implementation went:
[3–4 sentence narrative — outcome-focused, no consulting clichés]

Time to go live: [X months]

Benefits seen from NetSuite implementation:
[4–6 bullets]

What's next:
[2–3 bullets]

Customer quote:
"[quote]" — [Name, Title, Company]

Go live date: [date]
SuiteSuccess leveraged: [Yes / No]
If yes, how it helped: [1–2 sentences]

3–5 sentence spotlight overview:
[Why this implementation is an award candidate — lead with company, challenge, what Plative did,
what makes it exceptional. End with which category it fits and why.]

Unique Plative contributions:
[3–4 sentences — specific expertise, IP deployed, strategic guidance, measurable outcomes.
No generic consulting language.]
```

### Copy rules for spotlight submissions
- All narrative fields: active voice, sentences under 25 words
- No em dashes, no: leverage, seamless, transformative, robust, unlock, delve, navigate (metaphorical)
- "Customer" not "client"
- The 3–5 sentence overview must end by naming the award category and why this deal fits it
- "Unique Plative contributions" must cite specific IP, modules, or technical architecture — not generic praise
- If a field genuinely has no answer from the source, write `[TBD — confirm with Natalie]`

---

## Output D: Deal Review (Interactive Internal Debrief)

**Audience:** The Plative rep, their manager, and delivery leads. Not for NetSuite or the customer.

### Deliver as an interactive HTML artifact

Do not output a text block. Use `show_widget` to render the Deal Review inline in the chat as a tabbed card interface with five tabs. This is the default — no download or file-open step required.

Only write to `/mnt/user-data/outputs/[CompanyName]_DealReview.html` if the user explicitly asks to save or share the file. Use Plative brand colors throughout.

### Tab structure

**Tab 1 — Company**
- Industry / microvertical (specific: "SaaS / Subscription Billing", not "Software")
- HQ location
- Annual revenue
- PE/VC backed (Yes — firm name / No)
- Systems replaced (pill list)
- Why they moved: 1–2 sentence burning platform summary (honest, not boilerplate)

**Tab 2 — Deal**
- ACV (prominent, large type)
- Contract type: Fixed fee / T&M / Hybrid
- Timeline and go-live date
- Competitors in deal (or "Uncontested")
- Why we won: 3–5 bullets — specific, what actually moved the deal
- Key objections overcome: list with 1-line resolution each (omit section if none)

**Tab 3 — Solution**
- NetSuite modules (exact names, displayed as pills or a clean list)
- SuiteApps (or N/A)
- Integrations (system + 3-word purpose per item)
- Plative IP deployed (or N/A)
- Flags row: OneWorld | ARM | SuiteBilling — each shown as YES/NO badge
- NetSuite AI: modules and use case, or "Not in scope — [potential fit] noted for upsell"

**Tab 4 — Delivery**
- How implementation went: 3–4 sentence honest narrative (this is internal — name challenges)
- Key risks or complexities: bullets (infer from scope if not stated — multi-entity, heavy migration, etc.)
- Customer engagement quality: High / Medium / Low badge + 1-sentence context
- Benefits delivered: 4–6 outcome bullets
- Is customer referenceable: Yes / No / Pending badge

**Tab 5 — What's Next**
- Upsell / expansion signals: modules, users, subsidiaries, AI (be specific)
- Renewal or support status (if known)
- Open items: anything unresolved or TBD
- Lookalike value section:
  - Who to show this to: 1–2 sentences on ideal prospect/AE match
  - Reference industries: list of verticals this deal is reusable for
  - Spotlight Award candidate: Yes (category) / No / Maybe (note what's missing)

### HTML design spec

```
Brand colors:
  Navy:    #262A42  (tab bar background, header)
  Crimson: #E14136  (active tab indicator, ACV highlight, key stat accents)
  Gold:    #DEAB57  (badges for positive signals — referenceable, AI live, etc.)
  Teal:    #0D9DA4  (secondary badges — flags, contract type)
  White:   #FFFFFF  (card backgrounds)
  Gray:    #F4F5F6  (page background, inactive tab background)

Typography: system-ui / sans-serif (Open Sans not available in artifact)

Layout:
  - Full-width header bar: navy, company name in white 20pt bold + deal date/team line in 12pt gray
  - Tab row: pill-style or underline tabs, navy inactive / crimson underline active
  - Content area: white card, 24px padding, max-width 760px, centered
  - Bullets: 14px, 1.6 line height, no em dashes
  - Section subheads within tabs: 11px uppercase, letter-spacing 0.08em, crimson or gray
  - Pills/tags: 11px, rounded, use color-coded scheme above
  - ACV on Deal tab: 32px bold crimson, prominent

Behavior:
  - Tab switching via JS — no page reload
  - Active tab state clearly indicated
  - All five tabs accessible; default open on Tab 1
  - If a field is TBD, render as a gray italic placeholder, not an empty gap
```

### Field guidance

**"Why we won"** — pull from Spotlight "Why NetSuite over competitors" and "Unique Plative contributions." Rewrite for internal frankness. Competitive deals: say so. Rollovers: say so.

**"How implementation went"** — pull from Spotlight but be honest. This is internal. If there were delivery challenges, name them.

**"Key risks or complexities"** — infer from scope (multi-entity, ARM, heavy customization, legacy migration) if not stated.

**"Lookalike value"** — the rep's "who else should see this." Match on industry, PE backing, systems replaced, or deal size.

### Copy rules
- Active voice, sentences under 25 words
- No em dashes, no consulting clichés
- "Customer" not "client"
- Missing data: render as `TBD` in gray italic — do not fabricate
- Internal only: do not soften delivery issues or inflate outcomes

---


---

## Output F: Enablement Deck Panel

**Audience:** Internal — vertical enablement decks presented to NetSuite AEs, prospects, and at field events.
**Purpose:** A right-side deal snapshot panel injected into an existing vertical enablement slide (e.g. the C&E deck slides 10-15). The left side of the slide already contains the architecture/solution diagram. This panel populates the right half.

### When to trigger

Trigger when the user says: "enablement slide", "deal panel", "add to enablement deck", "vertical enablement", "C&E slide", "add to the deck", "populate the panel", or uploads an enablement .pptx and asks to fill in deal details.

### Panel fields

Extract or infer these seven fields from the deal source. Mark missing ones `TBD`.

| Field | Notes |
|---|---|
| **Company** | Full name + vertical + one-line business description |
| **Cost & Timeline** | Use discounted ACV. Format: `$XXXk \| XX-XX weeks` |
| **Systems Replaced** | 1-2 systems, pipe-separated. Be specific — "QuickBooks (x10 files)" not just "QuickBooks" |
| **NetSuite Modules** | Comma-separated exact names. Integrations on a separate line in teal |
| **Plative IP** | List only if deployed. Exact IP name + 1-line benefit. Omit section entirely if none |
| **Key Challenges** | 3-4 bullets, 10-12 words each. Outcome-focused. No consulting language |
| **Why Plative** | 3-4 bullets, 10-12 words each. Specific differentiators — track record, IP, integration expertise |

### Panel design spec

The panel sits on the **right half** of a standard 16:9 Plative enablement slide (`9144000 × 5143500 EMU`).

```
Panel geometry (EMU):
  x: 4750000       — starts at roughly the horizontal midpoint
  y: 1017725       — aligns with bottom of slide title bar
  width: 4100000
  height: 4020000  — adjust if IP section is present (add ~440000)

Header bar:
  fill: #2D2D2D (dark charcoal)
  height: 310000
  text: "[COMPANY NAME]  |  DEAL SNAPSHOT"
  font: Calibri 10pt bold white

Section labels (COMPANY, COST & TIMELINE, etc.):
  font: Calibri 7pt bold
  color: #262A42 (navy)
  ALL CAPS

Body text:
  font: Calibri 8.5-9pt
  color: #323232 (dark charcoal)

Dividers between sections:
  fill: #E8E9EC (light gray)
  height: 16000 EMU

Cost figure:
  font: Calibri 14pt bold
  color: #E14136 (crimson)

Integrations line (if present):
  color: #0D9DA4 (teal) — visually separates from core modules

Plative IP text (if present):
  color: #425582 (soft navy) — differentiates from module list

Card background: #FFFFFF
Card shape: roundRect, adj=3000
```

### Vertical position sequence (y coordinates, EMU)

Use these anchor points. When a Plative IP section is present, shift everything from Key Challenges downward by ~440000 EMU.

```
Header bar:       y=1017725,  h=310000
Company TB:       y=1370000,  h=300000
Div 1:            y=1688000,  h=16000
Cost TB:          y=1718000,  h=320000
Div 2:            y=2056000,  h=16000
Systems TB:       y=2086000,  h=270000
Div 3:            y=2374000,  h=16000
Modules TB:       y=2404000,  h=500000   (expand if integrations line wraps)
Div 4:            y=2920000,  h=16000
[IP TB:           y=2950000,  h=380000]  — only if IP present
[Div 5:           y=3350000,  h=16000]   — only if IP present
Challenges TB:    y=2950000 (no IP) or y=3400000 (with IP),  h=720000
Div (last):       y=3686000 (no IP) or y=4136000 (with IP),  h=16000
Why Plative TB:   y=3716000 (no IP) or y=4166000 (with IP),  h=1000000
```

### Build workflow

1. Read the existing enablement .pptx using the `pptx` skill workflow (unpack, identify target slide)
2. Extract deal data from the source (proposal deck URL, SOW, or pasted notes)
3. Inject the panel XML into the target slide's `<p:spTree>` before `</p:spTree>`
4. Each shape in the panel gets a unique `id` — use `base_id + offset` starting from a high number (e.g. 4000+) to avoid collisions with existing slide shapes
5. Pack and QA:

```bash
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf [output.pptx]
pdftoppm -jpeg -r 150 [output.pdf] slide
view slide-[N].jpg
```

6. Check: no text overflow, sections don't bleed into each other, header bar correct color, teal integrations line visible

### Copy rules

- "Cost" not "ACV" in the panel header (user preference established June 2026)
- No em dashes in any text field
- Systems Replaced: be specific about quantity and type ("10 separate QuickBooks files", not "QuickBooks")
- Modules: exact NetSuite product names. Use semicolons only if line is very long
- Key Challenges: past tense where possible ("No consolidated view across entities")
- Why Plative: lead with the specific differentiator, not a generic claim ("Plative Rental Management IP", not "strong IP portfolio")
- If Plative IP section is present, label it `PLATIVE IP` in the panel
- TBD fields: render as gray placeholder text, list at end of response for user to fill

### Reference implementation

The canonical example of this panel is the Tempest Energy panel on slide 10-11 of `Plative_for_C_E_Enablement.pptx`. That slide's XML in the C&E enablement deck is the ground truth for shape structure, font sizes, and positioning.

Panel was built and iterated across six C&E deals (Tempest Energy, Kinsley Group, Total Fire Protection, GeoLinks, Atlas Pressure Control, Biochem Environmental) in June 2026. All six panels are in the enablement deck at `/mnt/user-data/outputs/Plative_C_E_Enablement_FINAL3.pptx`.

---

## Multi-deal batching

When submitting multiple Spotlight entries from a tracker sheet:
1. Identify which sheet tabs are marked complete (✅ prefix in tab name)
2. Generate Output C for each complete submission
3. Stack with `---` dividers between companies
4. Note which remaining companies on the Winter 2026 Submissions tab still need data

---

## Quality checklist (all outputs)

- [ ] No em dashes
- [ ] No: leverage, seamless, robust, transformative, unlock, delve
- [ ] "Customer" not "client"
- [ ] Exact NetSuite and Plative product names throughout
- [ ] ACV uses discounted rate if both present
- [ ] Bullets outcome-led, not process descriptions
- [ ] Customer quote attributed with Name, Title, Company
- [ ] TBD fields listed at end for user to fill

---

## Dependencies

- `slide-templates` skill — pptxgenjs, brand constants, logo assets
- `plative-voice` skill — all copy
- `Google Drive:read_file_content` — Google Slides or Sheets source
- `pptx` or `file-reading` skill — uploaded deck source
