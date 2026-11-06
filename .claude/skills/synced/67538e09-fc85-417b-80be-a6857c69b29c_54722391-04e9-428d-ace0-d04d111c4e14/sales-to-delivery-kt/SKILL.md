---
name: sales-to-delivery-kt
description: Builds a Plative-branded internal Sales-to-Delivery Knowledge Transfer (KT) document for a signed NetSuite or Salesforce engagement, so delivery consultants inherit everything sales learned during the deal. Use this skill whenever someone at Plative says "KT doc", "knowledge transfer", "sales to delivery handoff", "hand this off to delivery", "brief the delivery team", "onboard delivery onto [client]", "prep the delivery team for [client]", or asks to turn presales material (transcripts, SOW, discovery notes) into a delivery handoff summary for a closed-won deal. Trigger it even when the person names only the client and the word "handoff" or "KT", or when a Client Partner is packaging up a won opportunity for the consultants who will deliver it. This skill is scoped specifically to the moment a deal transitions from sales to delivery — it pulls the Salesforce Opportunity, reads the presales transcripts, researches the client, and produces [ClientName]_Knowledge_Transfer.docx.
---

# Sales-to-Delivery Knowledge Transfer

This skill produces one deliverable: a 2-4 page Word document, `[ClientName]_Knowledge_Transfer.docx`, that hands a signed deal from the sales team (Client Partner + Solution Architect) to the delivery consultants who will run the implementation.

The core problem it solves: a sales cycle can run from two weeks to over a year, accumulating demos, discovery calls, solution reviews, and scope changes. Almost none of that context survives the handoff today. A consultant walking into a new project should not have to reconstruct what was already learned. This document captures it — the decisions, the people, the risks, the things said off the record — so the first six months of delivery start from knowledge rather than guesswork.

Read this whole file before starting. The workflow is a fixed sequence of four interactions with the user, and the quality of the document depends on gathering source material in the right order.

---

## Design principles (read first — these govern every section)

**Never guess or fabricate.** Every field the document can't source from real material is marked `NEEDS INPUT` in the output, visibly, so the Client Partner knows exactly what to fill in. A confidently-worded but invented stakeholder role or migration detail is worse than a blank, because delivery will act on it. When in doubt, leave `NEEDS INPUT`.

**Supersede, don't accumulate.** A long sales cycle changes its mind. A client asks for X in month one and drops it in month six. The document must report the *final* state of every decision, not the history. Where something was actively reversed or descoped, note it briefly ("Royalties automation was discussed early but explicitly moved to a later phase") because a consultant who sees X mentioned in an early document needs to know it's no longer live. Read transcripts chronologically so the latest word wins.

**Flag conflicts, don't resolve them.** When the SOW and the transcripts disagree on scope, price, or timeline, surface both and mark the discrepancy. The skill is not authorized to decide which is right — that's a human call, and silently picking one hides a problem delivery needs to see.

**Auto-detect the platform.** Plative runs both NetSuite and Salesforce engagements. Detect which from the Salesforce data (the `Line_of_Business__c` field and the scope line items make it obvious) rather than asking. Only ask if the sources are genuinely ambiguous.

**Write for a consultant, not a salesperson.** The reader is technical, inheriting the work, and time-pressured. Deal economics that don't change how the work is done (exact ARR, commission, payment schedules) don't belong here. What belongs is anything that changes how a consultant will behave: scope boundaries, who holds authority, who's difficult, what's fragile.

---

## The four-step runtime flow

Do these in order. Steps 1-2 gather and confirm sources; step 3 collects what no system can know; step 4 is a gate before generation. Front-load everything automatic so the user is only asked for what genuinely requires a human.

### Step 1 — Client name → Salesforce Opportunity

Ask the user for the client name. That single input unlocks most of the document.

Search Salesforce for the Opportunity (see `references/salesforce-fields.md` for the exact query patterns — use SOSL for the initial fuzzy match, it handles partial and misspelled names better than SOQL). Fuzzy name matches routinely return more than one candidate (a parent account, a similarly-named deal, an unrelated opportunity that merely mentions the client). When more than one plausible match comes back, list them with enough detail to disambiguate (deal name, stage, amount, close date) and let the user pick. Confirm the single right Opportunity before pulling anything else — everything downstream depends on anchoring to the correct record.

If the client has several opportunities (e.g. a new implementation plus existing managed services), surface them and ask which one anchors this KT doc.

Once confirmed, pull the full field set in one read and map it to the document sections. The complete mapping — which field feeds which section, and which fields are reliable vs. unreliable — lives in `references/salesforce-fields.md`. Read that file when you reach this step. The high-value points that shape the flow:

- **Client Partner** comes from the Opportunity Owner. **Solution Architect** is *not* a field on the Opportunity — it lives on the `OpportunityTeamMember` child with the role "Pre-Sales Consultant." **Delivery Manager** is the `Delivery_Manager_Act__c` lookup. All three are reliable when present.
- Scope, exclusions, assumptions, timeline, billing type, and a rich deal synopsis are all structured fields — pull them directly rather than reconstructing from transcripts.
- The presales Drive folder and the signed SOW are usually already linked on the record (`PSA_Google_Folder_Link__c`, `SOW_POW_CO_Link__c`). Use these as the default sources in Step 2 rather than asking the user to hunt for them.
- **Stakeholders are the big exception.** Salesforce typically has only the primary contact (often just one person). The real stakeholder map lives in the transcripts. Do not treat the Salesforce contact list as complete.

### Step 2 — Confirm the presales sources

The document's depth comes from the presales material. Two source types:

**Meeting transcripts.** Check for a connected meeting notetaker (Fathom, Fellow.ai, Granola — whichever the user has authorized; check generically rather than assuming one). Each user can only reach their own notetaker account, so if none is connected, prompt them: to pull meetings automatically they need to connect their notetaker, otherwise point to the transcript files in the Drive folder. If a notetaker is connected, confirm before pulling: "I see [tool] connected — should I pull the [client] meetings from it?"

**The presales Drive folder.** The Opportunity usually carries `PSA_Google_Folder_Link__c`. Present it rather than asking cold: "I found this presales folder on the Opportunity — should I use it as the source for the SOW and other client documents?" The user confirms or overrides. This one folder is assumed to hold the SOW plus everything else the client provided (RFPs, technical specs, prior-vendor docs), matching how Plative organizes deals in Drive.

**On the SOW specifically:** there should be exactly one authoritative SOW. If the folder or the `SOW_POW_CO_Link__c` field surfaces multiple contract documents (change orders, prior drafts — note the field name literally includes "CO" for change order), stop and ask the user to confirm which single file is the signed, authoritative SOW. Don't guess from filenames.

**Handling transcript volume.** A year-long deal may have twenty or more transcripts — more than fits comfortably in one pass. Read them chronologically and build up a running picture, applying the supersede principle: later decisions overwrite earlier ones. You're not summarizing every call, you're resolving toward the final state of scope, stakeholders, risks, and open questions. Prioritize solution reviews, scoping calls, and the most recent conversations, which carry the decisions that stuck. The `Mutual_Close_Plan__c` field on the Opportunity often contains a dated log of the whole deal — use it as a map of which meetings mattered.

### Step 3 — Tribal knowledge

Ask one open question, because this is the category of information that appears in no system and no transcript:

> "Anything you want to flag that wouldn't show up in the documents or recordings? Internal politics, a stakeholder who needs careful handling, something said off the record, a reason we really won this deal, anything a consultant should know but that was never written down."

This is the Client Partner's chance to hand over what's in their head. It's often the single most valuable input to the whole document. Fold whatever they say into the relevant sections (usually Stakeholders, Risks & Sensitive Topics, or Deal Context).

### Step 4 — Gap check, then generate

Before writing the document, summarize what you have and what's missing, and wait for the user to approve:

> "Here's what I've gathered: [Opportunity fields ✓], [N transcripts ✓], [SOW ✓], [client web research ✓]. Still missing: [Delivery Manager — NEEDS INPUT], [LinkedIn for 2 of 5 stakeholders]. Want to fill any of these before I generate, or should I proceed and mark them NEEDS INPUT?"

This gives the user one last chance to correct course before generation rather than discovering gaps in the finished file. When they approve, generate the document (see "Generating the document" below).

---

## Research the skill performs automatically

Two enrichment passes happen without asking, during Steps 2-4:

**Client company profile (always).** Web-search the client's business using their website (on the Opportunity as `Account.Website`) to understand what they actually do — their industry, size, business model, what makes them tick. This feeds the Client Profile section and grounds the Fit-Gap analysis in their real operations rather than generic assumptions.

**Stakeholder LinkedIn enrichment.** For stakeholders identified in the transcripts, do a public web search to find their LinkedIn profile and background. Match on name *plus* company *plus* a corroborating detail (title or location) before attaching a profile — common names produce wrong matches, and a confidently wrong profile is worse than none. Where a match is uncertain, mark it rather than guessing. The final stakeholder list is explicitly the Client Partner's to verify, so present it as "confirm these" rather than asserting completeness.

---

## Document structure

The output is `[ClientName]_Knowledge_Transfer.docx`, generated locally and presented for download, 2-4 pages. Use the Plative brand skill for styling (colors, fonts, logo) and the docx skill for construction. Read `references/document-template.md` for the full section-by-section content spec, including what feeds each section and how to render the tables. The nine content sections plus header:

1. **Header** — client, account tier, Client Partner, Solution Architect, Delivery Manager, key dates, opportunity number
2. **Executive Summary** — who they are, what they bought, why now, engagement shape
3. **Client Profile & Deal Context** — what the company does (web research), competitive backdrop, why we won, and a short **Key Terms** glossary of the client's own language and internal system names (never substitute Plative jargon)
4. **Scope, Goals & Explicit Exclusions** — what's in, the business outcomes, and what was deliberately left out (the exclusions prevent the scope-creep arguments that surface six months in)
5. **Current State / Technical Landscape** — existing systems, integrations, data volumes (text/table, no diagram)
6. **Fit-Gap Analysis** — current-state pain points mapped to the proposed solution
7. **Stakeholders & Decision-Making** — table: name, title, LinkedIn, role in deal (decision maker / champion / influencer / blocker), behavioral notes from transcripts, and where decision authority and escalation sit
8. **Risks & Sensitive Topics** — table: area, risk/assumption, confidence (High/Medium/Low); includes pricing sensitivity as a behavioral cue, prior-vendor history, anything to handle carefully
9. **Licensing & Delivery-Relevant Commercial Terms** — licensing/modules/user counts, T&M vs. fixed (it changes how delivery handles change orders), anything unconfirmed flagged `NEEDS INPUT`
10. **Links & Source Index** — SOW, presales folder, Opportunity record, transcripts used

---

## Quality checklist (run before presenting the file)

Verify, and fix anything that fails, before handing over the document:

- Every section present; nothing silently dropped.
- Every unknown shows `NEEDS INPUT` — no invented names, roles, numbers, or migration details.
- SOW-vs-transcript conflicts are flagged, not resolved.
- Decisions reflect final state; reversals noted where they'd otherwise confuse.
- Every risk carries a confidence level.
- Stakeholder LinkedIn matches are corroborated or marked uncertain; the list is framed for Client Partner review.
- No commercial detail that delivery doesn't need (exact ARR, commissions, payment schedules).
- Sensitive/off-the-record notes are present (this file is internal, not client-shared) but written professionally.
- Filename is exactly `[ClientName]_Knowledge_Transfer.docx`.

---

## Reference files

- `references/salesforce-fields.md` — exact query patterns and the full field-to-section mapping. Read at Step 1.
- `references/document-template.md` — section-by-section content spec and table layouts. Read before generating.
