# Document Template Reference

The output is a 2-4 page Word document, `[ClientName]_Knowledge_Transfer.docx`. Build it with the `docx` skill and style it with the Plative brand skill (navy + crimson, Open Sans, logo). Keep it tight — a consultant should be able to read the whole thing in ten minutes and come away knowing how to start.

General rules for every section:
- Anything unknown is written as **NEEDS INPUT** (bold), never invented or left silently blank.
- Prose over bullets where it reads better, but tables where the content is genuinely tabular (stakeholders, risks, licensing).
- Final state only — where a decision was reversed during the deal, say so in one clause so an old reference elsewhere doesn't confuse the reader.
- Where the SOW and transcripts conflict, show both and mark it, e.g. "SOW lists 3 integrations; final scoping call added a 4th (EDI) — confirm."

---

## 1. Header

A compact block or table at the top:

- Client name
- Account tier (`Account_Tier__c`)
- Client Partner (Opportunity Owner)
- Solution Architect (`OpportunityTeamMember`, "Pre-Sales Consultant" role)
- Delivery Manager (`Delivery_Manager_Act__c`, or **NEEDS INPUT**)
- Intended start date (`Intended_Start_Date__c`)
- Opportunity number (`Opportunity_Number__c`)
- Platform (NetSuite / Salesforce, auto-detected)

## 2. Executive Summary

Three to five sentences. Who the client is, what they bought, why now, and the shape of the engagement (phased? single phase? timeline). Seed from `Synopsis__c` but rewrite for a delivery reader — the synopsis is sales-toned; make it plain and operational.

## 3. Client Profile & Deal Context

- **What they do:** from the automatic web-research pass on `Account.Website`, grounded in their actual business (industry, size, model). Two or three sentences.
- **Why we won / deal context:** draw on `Mutual_Close_Plan__c` (the dated deal log) and anything the Client Partner shared in Step 3. If there's no competitive intel (`SI_Competition__c` = "We dont know"), don't invent one.
- **Key Terms glossary:** a short list of the client's own vocabulary — internal system names, acronyms, product lines, team names — as *they* use them. Do not substitute Plative's standard terms. A consultant who walks into a call and hears "Bookmaster" or "the IoA series" should be able to look it up here.

## 4. Scope, Goals & Explicit Exclusions

- **In scope:** from the `OpportunityLineItem` breakdown and the SOW. Group logically (financials, data migration, integrations, training) rather than dumping line items.
- **Goals / business outcomes:** what the client is trying to achieve, from transcripts and `Synopsis__c`.
- **Explicit exclusions:** from `Out_of_Scope_and_Road_Map__c`, verbatim where possible. This is one of the highest-value parts of the whole document — it's what prevents the "but I thought that was included" arguments months in. Include items that were discussed and deliberately deferred to a later phase, noting them as such.

## 5. Current State / Technical Landscape

Text and/or a simple table — no diagram. Existing systems being replaced or integrated, known integrations, data volumes, and anything about the current environment that affects migration. Data migration is usually the riskiest, most-underestimated part of an implementation, so capture whatever the transcripts revealed about data quality, volume, and ownership. Mark unknowns **NEEDS INPUT**.

## 6. Fit-Gap Analysis

Map current-state pain points to the proposed solution. A two-column table works well: "Current pain / requirement" → "How the solution addresses it (and any gap)." Ground this in the client's real operations (from web research and transcripts), not generic platform capability. Where the solution only partially addresses a need, say so — that gap is exactly what delivery needs to plan around.

## 7. Stakeholders & Decision-Making

A table. This is where transcripts matter most, since Salesforce holds only the primary contact.

| Name | Title | LinkedIn | Role in deal | Notes for delivery |
|---|---|---|---|---|

- **Role in deal:** decision maker / champion / influencer / blocker. From transcript behavior and Client Partner input.
- **LinkedIn:** corroborated match (name + company + title/location) or marked uncertain; omit rather than guess wrong.
- **Notes for delivery:** communication style, what they care about, how they behave in meetings, where they sit in the decision and escalation chain. This is the "how to work with this person" column — the difference between a consultant landing well on the first call and stumbling. Fold in whatever the Client Partner shared in Step 3.

Frame the table as "confirm these" — the Client Partner owns final verification of the list.

## 8. Risks & Sensitive Topics

A table:

| Area | Risk / assumption | Confidence |
|---|---|---|

- **Confidence:** High / Medium / Low — forces honesty about what's actually known vs. assumed.
- Include **pricing sensitivity** here as a behavioral cue (e.g. "Client negotiated hard on rate — approach change orders carefully"), not as a financial figure.
- Include prior-vendor history, internal friction, immovable constraints, and anything from Step 3 that a consultant should tread carefully around.
- This file is internal and not shared with the client, so off-the-record notes belong here — but write them professionally, as guidance rather than gossip.

## 9. Licensing & Delivery-Relevant Commercial Terms

- Licensing / modules / SKUs and user counts (from SOW and line items). Call out third-party products separately from the core platform.
- Billing model: T&M vs. fixed (`Billing_Type__c`). State it plainly and note what it means for scope management — fixed-bid makes change orders a negotiation; T&M gives more room.
- Anything not finalized at signature (e.g. a module whose licensing wasn't confirmed) → **NEEDS INPUT**.
- Do not include exact ARR/TCV, commissions, or payment schedules.

## 10. Links & Source Index

Plain list of everything the document was built from, so delivery can go to source:
- Signed SOW (`SOW_POW_CO_Link__c`)
- Presales Drive folder (`PSA_Google_Folder_Link__c`)
- Salesforce Opportunity (record link / `Opportunity_Number__c`)
- Transcripts used (which meetings, dates)
- MSA (`MSA_Link__c`) if relevant
