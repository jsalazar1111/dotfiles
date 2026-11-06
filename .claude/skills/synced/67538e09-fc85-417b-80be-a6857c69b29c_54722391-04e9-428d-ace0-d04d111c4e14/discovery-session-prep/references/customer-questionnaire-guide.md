# Customer-Facing Onboarding Questionnaire — Build Guide

This is the companion output to the internal Discovery Session Prep Guide.
Where the prep guide is written for the consultant and includes every
question from the relevant process area files, this questionnaire goes to
the customer and includes only a small, filtered subset, translated into
plain language they can answer in about 15 minutes.

Read `/mnt/skills/organization/plative-brand/SKILL.md` and
`/mnt/skills/organization/plative-voice/SKILL.md` before building this —
this is a customer-facing deliverable, so it uses actual Plative brand
(Navy `#262A42`, Crimson `#E14136`, Gold `#DEAB57`, Teal `#0D9DA4`, Open Sans),
not the internal working-doc styling used for the prep guide itself.

## Which questions make the cut

Only pull from the prep guide's **Open** and **Partial** questions — anything
already Answered from the SOW/KT doc doesn't need to go back to the customer.
From that pool, keep a question only if it meets at least one of these bars:

- **Changes a configuration decision** (e.g. how many assets/locations —
  affects data migration limits; whether subcontractors need mobile access —
  affects licensing; how maintenance contracts are priced — affects billing
  setup)
- **Resolves a genuine contradiction or gap found in the source material**
  (e.g. an SOW that both references an existing CRM and says it's being
  replaced — ask the customer directly rather than guessing)
- **Can't be reasonably answered any other way** (only the customer knows
  their own volumes, pain points, or current-state habits)

Drop anything that's:
- Already covered by the SOW's confirmed or out-of-scope lists
- Internal NetSuite configuration detail the customer has no way to answer
  in their own words (e.g. "do you require 3-way match" — ask "how do you
  currently approve vendor bills" instead, or drop it if the SOW already
  settled it)
- A "nice to know" that doesn't change what gets built

Target 20-35 questions total across all sections. If the filtered list is
still long, group repetitive items (e.g. one shared field-service section
instead of separate blocks per use case) rather than cutting corners on
what actually matters.

## Translating consultant language into customer language

The customer has never heard of the process areas this skill is organized
around. Rewrite every surviving question in the customer's own vocabulary:

| Internal / NetSuite phrasing | Customer-facing phrasing |
|---|---|
| "Case Management" / "Call to Resolution" | "customer support" / "service requests" |
| "3-way match" | "how you approve vendor bills today" |
| "SuiteBilling" / "ARM" | "how you bill customers" / "when revenue counts as earned" |
| "Work orders" / "routings" | "how a job moves from start to finish" |
| "FSM use case" | "installation," "maintenance," "repair" (call it what it is) |
| "Data migration objects" | "what we're moving over from your current system" |

If a question can't be translated without losing its meaning, it's probably
too technical for this document — leave it for the live session instead.

## Format

- Checkboxes and short blanks over open paragraphs wherever a category will
  do. A form that takes 15 minutes gets filled out; one that asks for essays
  doesn't.
- Group into short, clearly labeled sections (lettered A, B, C...) mirroring
  the prep guide's process areas, but merge sections that would otherwise
  repeat the same questions (e.g. one combined field-service section instead
  of one per FSM use case).
- Add a one-line "why we ask" note under any question that isn't
  self-evidently useful to the customer — it builds trust and improves
  answer quality.
- Keep a short intro (what this is, how long it takes, what to do if unsure)
  and a short closing (where to send it, what happens next).
- Plative brand: Navy header band with the Plative wordmark, Crimson for the
  product name/accent, Gold for section letters, Teal for the closing
  callout. Open Sans throughout (see plative-brand skill for exact usage).
- Plative voice: no em-dashes, no jargon, "you/your team" (this is written
  directly to the customer, not about them), active voice, contractions are
  fine since this is a friendly working document, not a legal one.

## Output

Word document: **"[Customer Name] — Onboarding Questionnaire"**, saved
alongside the internal prep guide. Validate with
`python3 /mnt/skills/public/docx/scripts/office/validate.py` before copying
to `/mnt/user-data/outputs/`.
