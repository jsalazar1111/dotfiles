---
name: customer-onboarding-deck
description: Generates a Plative customer onboarding slide deck (.pptx) by pulling meeting notes, transcripts, and the SOW from the customer's Google Drive folder and filling them into the standard onboarding template. Use this skill whenever someone asks to "build an onboarding deck," "create the onboarding presentation," "put together onboarding slides for [customer]," or mentions building/prepping an onboarding deck for a named customer. Also trigger when the user references "onboarding meeting," "kickoff prep," or asks to turn presales/SOW content into an onboarding deck. Always use this skill before building an onboarding deck from scratch — the only input required from the user is the customer name; everything else is researched from Drive.
---

# Customer Onboarding Deck Generator

Builds a Plative-branded customer onboarding deck by combining a fixed template with
customer-specific content pulled from that customer's Google Drive folder.

Bundled resources:
- `assets/onboarding-template.pptx` — structural template (see step 7)
- `references/role-descriptions.md` — master Project Role / Description / Touchpoint
  list for slide 9; append to it when a new role type comes up (see step 7)

## Workflow

### 1. Get the customer name

If not given, ask for it. This is the only required input.

### 2. Find the right Drive folder

Structure is always: **Shared Drive named after the customer** → one or more **project
folders** → inside each project folder, subfolders including `0. Presales` and
`1. KT Docs and SOW` (numbering/naming may vary slightly, match loosely).

- Search Google Drive for a Shared Drive matching the customer name.
- List project folders inside it. If there's only one, use it.
- **If there are multiple project folders, default to the most recently created one,
  but confirm with the user before proceeding** — say which folder you picked and why,
  and let them redirect you.

### 3. Gather context from `0. Presales`

Read every doc, note, and transcript in this folder (Google Docs, Google Meet
recording transcripts, meeting notes). This is where you'll typically find:

- Client sponsor names/titles and Plative team assignments (sponsorship, PM, consultants)
- Discussion of tools/communication preferences (Slack channel, email alias, meeting cadence)
- Any commentary on scope, timeline, or roadmap not yet formalized in the SOW
- Names of client-side stakeholders and their roles

Use `Google Drive:search_files` scoped to the folder, then `read_file_content` on
each doc. For transcripts, skim for names, roles, and commitments rather than
reading verbatim — you're extracting facts, not summarizing the whole call.

### 4. Gather scope from `1. KT Docs and SOW`

The SOW is a PDF in this folder. Download and read it (see `/mnt/skills/public/pdf-reading/SKILL.md`
if you need extraction help). Pull:

- Engagement summary / project description
- In-scope and out-of-scope line items
- Key dates / milestones
- Phase or week-by-week roadmap (if the SOW includes a schedule; otherwise check
  Presales notes or ask the user for the resource plan/timeline)
- Named roles and resourcing (Delivery Director, PM, Consultants, etc.) if listed

### 5. Get final team staffing from Slack

Team assignments are frequently finalized in Slack *after* the SOW is signed and
often aren't reflected anywhere in Drive yet. **Always check Slack before treating
team/PM staffing as missing.** Search the customer's dedicated Slack channel
(commonly named like `ZC:<channel-id>:<Customer Name>`) for a staffing announcement
from **Muhammad Bilal Shahid** (resourcing lead) — messages listing names against
roles like PM/DM, Architect, BA, Developer/Consultant. Use
`slack_search_channels` to find the channel, then `slack_search_public` (or
`slack_read_channel`) with the customer name, and read any thread mentioning
"team," "KO," "assigned," or "staffed." This is the authoritative source for
slides 4 and 5 (PM and team) when Drive doesn't have it yet — treat it as a
required lookup, not a fallback to try only after everything else fails.

### 6. Confirm remaining gaps before building

If sponsorship names, PM assignment, team members, roadmap dates, or admin-access
details aren't findable in Presales or the SOW, don't guess — ask the user for
just the missing pieces. Don't block the whole deck on one missing field; note
assumptions inline and flag them.

### 7. Build the deck from the template

Use `assets/onboarding-template.pptx` as the structural reference. Follow the
"Editing existing decks and templates" workflow in `/mnt/skills/public/pptx/SKILL.md`
(unzip → edit slide XML → validate). Do not build from scratch — the layout,
colors, fonts, and slide order are fixed and approved; only the content changes.

**Slides that get customer-specific content (edit these):**

| Slide | Content to fill in |
|---|---|
| 1 — Title | Customer name |
| 3 — Project Sponsorship | Plative sponsor(s)/client partner + client-side sponsor(s), names/titles/emails. **Remove the photo for each person** (delete the image, leave the circular frame empty or remove the frame too) — photos get added manually afterward. Only replace names/titles/emails. **Never guess a name for a sponsorship card** — this slide is customer-facing and a wrong name here is worse than a visible gap. Muhammad Bilal Shahid (internal resourcing/staffing lead) in particular should never be placed on this slide — he coordinates staffing internally but isn't a customer-facing sponsor. If a card's role (e.g. Delivery Director, Sales/Engagement lead) doesn't have a confirmed name from the SOW, Presales notes, or Slack, **replace that card with a plain yellow rectangle** (solid yellow fill, no border) with centered black bold text reading "SPONSOR TBD — CONFIRM WITH [role]" instead of leaving the template's placeholder person in place or guessing who fills the role. |
| 4 — Meet Your Project Manager | Assigned PM name/title. **Remove the photo** — leave name/title only. Note: removing the photo here leaves a large empty vertical gap (unlike slides 3/5, this photo has no separate frame/background shape), so after deleting it, move the name/title text block up to vertically center it in the space, rather than leaving it low on the slide. |
| 5 — Meet Your Team | Assigned team members excluding the PM (PM has their own slide — slide 4). **Remove each photo.** **Add or remove team-member card groups to match headcount**: the template ships with 2 card slots; if the team has 3+ non-PM members (e.g. Architect, AI Developer, BA), duplicate the card group (image placeholder + name text box + title text box) using `add_slide.py` on the shape group, or manually copy the `<p:sp>` group in the slide XML, for each additional member, then delete the leftover photo placeholder from each new copy. If the team has only 1 non-PM member, delete the second card's shape group entirely — don't leave an empty card. |
| 7 — Project Charter | Engagement summary, in-scope list, out-of-scope list, key dates — from the SOW |
| 8 — Project Roadmap | Week-by-week phases — from SOW schedule or resource plan; must stay consistent with Key Dates on slide 7 |
| 9 — Project Team Roles | **Dynamically build this table from `references/role-descriptions.md`** — a master list of Project Role / Role Description / Touchpoint. Include one row per role actually staffed on this engagement (from the SOW/resource plan/Slack staffing message), in the same order they appear in the master list. Delete rows for roles not staffed on this engagement — don't leave the template's default 4 rows if the real team differs. **If a staffed role isn't in the master list**, ask the user for a one-line description and touchpoint cadence (Daily / Weekly / Daily-Weekly / Intermittently), then append that role to `references/role-descriptions.md` so future runs don't have to ask again. The template also has a small role-hierarchy diagram on this slide, built from plain shapes/text boxes (not an image) — e.g. "Director," "Project Manager," "SF Lead Consultant," "Salesforce Consultant" as labeled boxes. **Delete those diagram shapes and replace the area with a single plain yellow rectangle** (solid yellow fill, no border) with centered black bold text reading "TEAM STRUCTURE VISUAL — TO BE CREATED." This slide's hierarchy diagram must be custom-built per engagement and isn't something this skill generates. |
| 11 — Communication Structure | Meeting names, purpose, frequency, client/Plative attendees |
| 14 — Communications Platforms | Update the project email distribution list address (pattern: `[customer]@plative.com`); include Slack row only if this is a Pro/Enterprise engagement |
| 15 — Admin Access | Username/email pattern for the customer's admin credential ask |
| 19 — Next Steps | Customer-side and Plative-side next steps, from Presales notes or SOW |

**Slides that stay as-is (boilerplate — copy unchanged):** 2 (Agenda), 6 and 13 and
18 (section dividers), 10 (Methodology), 12 (Kickoff Agenda), 16 (Discovery and
Architecture), 17 (Gathering Your Documentation), 20 (Questions), 21 (Thank You).

Table columns should match whatever the actual template's slide 9 table has —
some versions of this template have 2 columns (Role, Description), others have
3 (Role, Description, Touchpoint). Include the Touchpoint value from the master
list only if the template's table has that column; otherwise use just Role and
Description.

Slide 10/12/16/17 content is Plative-standard — never rewrite this copy to match
SOW language; it describes Plative's universal methodology, not this specific
engagement. Slide 9 is the exception: its role list is dynamic per engagement
(see the table above), even though each individual role's *description* text
comes from the fixed master list in `references/role-descriptions.md`.

Note: slide 8's title box has been widened in `assets/onboarding-template.pptx`
to fix a template defect where "Project Roadmap" wrapped to two lines and
overlapped the Week 0 bar. If a future template swap reintroduces this, widen
the title placeholder's `cx` rather than shortening the title text.

### 8. Validate against the proposal deck

Before finalizing, check `0. Presales` for a proposal or pitch deck (a `.pptx`
or Google Slides file, typically named like "[Customer] prospecting deck" or
"[Customer] proposal"). If found, read it and cross-check the onboarding deck's
engagement summary, scope, roadmap, and key dates against it — proposal decks
sometimes contain framing, phase names, or figures that predate or differ from
the signed SOW. Flag any material discrepancy to the user rather than silently
picking one source. **If no proposal deck exists in `0. Presales`, don't treat
this as a failure — note it explicitly to the user** ("no proposal deck found in
Presales; validated against the SOW only") so they know the cross-check didn't
happen.

### 9. QA

Follow the pptx skill's QA section: `markitdown` check for leftover placeholder
text or "The Edge"/prior-customer references, `validate.py --original` against
the template, then visual QA by converting to images and checking every edited
slide for overflow, wrong dates, or mismatched roadmap vs. charter dates.

### 10. Deliver

Save to `/mnt/user-data/outputs/[Customer] - Onboarding Deck.pptx` and call
`present_files`.

### 11. Upload to Drive once the generator confirms

After sharing the deck, ask the generator to review it and confirm it's ready
(e.g. "Does this look good to upload to the project folder?"). **Do not upload
automatically — wait for an explicit yes.**

**Known limitation:** `Google Drive:create_file` takes file content as inline
base64 text in the tool call. A finished onboarding deck is typically 5–10MB,
and passing that much base64 through a single tool call is impractical — it
burns an enormous number of tokens and risks silent truncation/corruption.
**Do not attempt to upload the raw pptx this way.** Once confirmed, instead:

1. Tell the generator the deck is ready and give them the file (already shared
   via `present_files`).
2. Ask them to drag it into the `1. KT Docs and SOW` folder themselves (one
   click from their downloads), or
3. If a browser-automation tool is available in the session, offer to open the
   destination Drive folder and upload the file from disk that way instead of
   through the content-upload API.

Confirm back with the generator once the file is in place, but don't claim
the upload happened if it went through option 2.
