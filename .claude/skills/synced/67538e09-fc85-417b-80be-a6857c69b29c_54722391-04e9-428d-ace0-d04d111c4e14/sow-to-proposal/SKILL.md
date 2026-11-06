---
name: sow-to-proposal
description: "Generates a Plative-branded client proposal deck (.pptx) from an uploaded Statement of Work (SOW) document. Trigger this skill whenever a user mentions 'proposal', 'SOW to proposal', 'proposal deck', 'client proposal', 'generate proposal', 'build a proposal', 'create a proposal from SOW', 'proposal from statement of work', or any request that involves converting a SOW or scope document into a client-facing proposal presentation. Also trigger when the user says 'proposal template', 'fill out the proposal', or 'turn this SOW into a deck'. This skill handles the full pipeline: reading the SOW, researching the customer, gathering discovery context, and producing a complete branded Plative proposal deck."
---

# SOW-to-Proposal Generator

Converts a Plative Statement of Work into a polished, client-facing proposal deck using the Plative Transform Proposal template.

## Prerequisites

Before starting, ensure you have:
- The `pptx` skill available (read `/mnt/skills/public/pptx/SKILL.md` for pptx creation/editing mechanics)
- The `plative-brand` skill available (read `/mnt/skills/user/plative-brand/SKILL.md` for brand guidelines)
- Web search available (for customer research)

## Workflow

Follow these steps in order. **Do not skip the information-gathering phase.** The quality of the proposal depends directly on how much context you collect before generating.

---

### Step 1: Ingest the SOW

The user will upload a SOW document (.docx, .pdf, or .txt). Read it thoroughly and extract:

**Project Fundamentals:**
- Customer name and industry
- Project objectives and business drivers
- Scope of work (what's being delivered)
- Out-of-scope items
- Key assumptions

**Solution Details:**
- Technology stack (Salesforce, NetSuite, etc.)
- Modules and features being implemented
- Integrations and data migrations
- Architecture overview

**Commercial Terms:**
- Deliverable line items with hours and costs
- Rate card (roles, rates, allocations)
- Timeline and phases
- Team structure and roles
- Total project cost

**Risk and Governance:**
- Key risks identified
- Assumptions and dependencies
- Communication and governance model

After reading, present a brief summary to the user confirming you understood the SOW correctly. List the key elements you extracted so they can flag anything missing or wrong.

---

### Step 2: Gather Customer Context

Ask the user the following questions. Present them conversationally, not as a form. Group related questions together.

**Required:**
1. Customer company name (confirm from SOW)
2. Who will present this proposal? (names + titles for the Presenters slide)
3. Key deal milestones and dates for the Mutual Success Plan (e.g., proposal date, target contract signing, target kickoff)

**Optional but valuable:**
4. Any specific stakeholder quotes from discovery calls?
5. Any competitive context? (are they evaluating other vendors?)
6. Any customer-specific pain points not captured in the SOW?
7. Current Plative stats for the "By The Numbers" slide (implementations completed, customer count, etc.)

---

### Step 3: Research the Customer

Using web search, research the customer company:
- What does the company do? What industry, size, recent news?
- What technology challenges are common in their industry?
- Any recent press releases, funding rounds, or leadership changes?
- Any public information about their current tech stack?

Use this research to:
- Write a more compelling Executive Summary that speaks to their specific situation
- Strengthen the "What We Heard" section with industry-relevant context
- Tailor the business outcomes to metrics that matter in their industry

**Keep research concise.** 2-4 searches max. The goal is color and context, not a research report.

---

### Step 4: Ingest Discovery Materials (Optional)

If the user uploads discovery call transcripts, meeting notes, or other context documents (.pdf, .docx, Google Doc):

- Read them thoroughly
- Extract stakeholder quotes (with attribution: name + title)
- Identify pain points and business challenges expressed in the customer's own words
- Note any requirements or priorities discussed that may differ from the SOW
- Flag any gaps between discovery notes and SOW scope

If no discovery materials are provided, proceed with SOW content alone. The proposal will still be complete, just less personalized in the "What We Heard" sections.

---

### Step 5: Generate the Proposal Deck

Read `references/template-structure.md` for the complete slide-by-slide mapping before starting.

**Use the template at:** `assets/proposal-template.pptx`
(The user's uploaded version or the skill's bundled copy)

**Follow the pptx editing workflow from `/mnt/skills/public/pptx/editing.md`:**

1. Copy the template to your working directory
2. Unpack: `python scripts/office/unpack.py proposal-template.pptx unpacked/`
3. Plan which slides to keep, remove, or duplicate based on project scope
4. Make structural changes (delete/duplicate/reorder slides)
5. Edit content in each slide XML, replacing all placeholder text with actual content
6. Clean: `python scripts/clean.py unpacked/`
7. Pack: `python scripts/office/pack.py unpacked/ output.pptx --original proposal-template.pptx`

**Content generation guidelines:**

- **Executive Summary (Slide 3):** This is the highest-impact slide. Write a tight 2-3 sentence summary that connects the customer's business pain to Plative's solution. Make outcomes specific and measurable.
- **What We Heard (Slides 6-8):** Use actual stakeholder quotes if available. If not, synthesize the customer's pain points into quote-style statements attributed generically (e.g., "Operations Lead"). Business imperatives should connect challenges to outcomes.
- **Solution sections (Slides 10-12):** Pull directly from SOW scope. Map each solution component to a business impact. Keep it strategic, not technical.
- **Pricing slides (Slides 28-31):** Pull exact numbers from SOW. Double-check math.
- **Mutual Success Plan (Slide 32):** Use the milestone dates the user provided.

**What to keep standard (minimal edits needed):**
- Slide 2 (Agenda): Just update subtitle text if needed
- Slide 15 (Transform Methodology): Keep standard
- Slides 21-22 (Communication Cadence / Client Alignment): Keep standard unless SOW specifies different governance
- Slides 23-26 (Why Plative): Keep standard boilerplate
- Slide 34 (Closing): Keep as-is

**Slides to potentially remove:**
- Slide 8 (Capability Assessment): Only if a formal assessment was done
- Slide 12 (Technical Architecture): Only if an architecture diagram description exists in SOW
- Slide 19 (Requirements Traceability): Only if relevant to project
- Slide 29 (Program Allocation): Only if using blended rates

---

### Step 6: QA

Follow the QA process from `/mnt/skills/public/pptx/SKILL.md`:

1. **Content QA:** Run `python -m markitdown output.pptx` and check for:
   - Missing or placeholder text (grep for `{{`, `XX`, `lorem`, `TODO`, `insert`)
   - Correct customer name throughout
   - Pricing math accuracy (hours x rate = total for each line item)
   - Consistent date formatting
   - All slide inspirations / internal notes removed

2. **Visual QA:** Convert to images and inspect:
   ```bash
   python scripts/office/soffice.py --headless --convert-to pdf output.pptx
   rm -f slide-*.jpg
   pdftoppm -jpeg -r 150 output.pdf slide
   ```
   Check for overlapping text, overflow, misaligned elements.

3. Fix any issues found, then re-verify.

---

### Step 7: Deliver

1. Copy the final deck to `/mnt/user-data/outputs/`
2. Use `present_files` to share it with the user
3. Provide a brief summary: "Here's your proposal for [Customer]. It covers [key sections]. Review slides X, Y, Z most carefully since those contain the customer-specific content."
4. Offer to make targeted edits

---

## Key Principles

- **Customer first, not Plative first.** The proposal should read as if we deeply understand the customer's world. Lead with their problems, not our capabilities.
- **Specificity wins.** "Reduce quoting errors by ~50%" beats "Improve operational efficiency." Pull specific metrics from the SOW whenever possible.
- **Don't fabricate.** If information wasn't in the SOW or discovery materials, don't invent it. It's better to have a placeholder the user can fill than a wrong number.
- **Match the template's voice.** The template uses professional but direct language. Avoid jargon-heavy consultant-speak. Short sentences. Active voice.
- **Pricing accuracy is non-negotiable.** Double-check every number on the investment slides against the SOW. A wrong number in a pricing slide destroys credibility.
