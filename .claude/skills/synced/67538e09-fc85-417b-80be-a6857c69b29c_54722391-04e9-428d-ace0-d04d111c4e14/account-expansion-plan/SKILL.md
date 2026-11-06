---
name: account-expansion-plan
description: >
  Generates a Plative Account Expansion Plan (branded one-pager slide plus contact-map
  and sources appendix) for a named customer account, pulling Salesforce account and
  project data, Monid firmographic and tech-stack enrichment, web research on PE
  ownership, and contact interaction history from Gmail, Google Calendar, Fellow, and
  Granola. Use this skill whenever a Plative sales rep or client partner asks to "build
  an account expansion plan," "create an account plan," "put together a plan for
  [customer]," or names a customer alongside "expansion," "account plan," "cross-sell,"
  "AI play," or "who are we talking to at [customer]." The only input required from the
  rep is the account name; everything else is researched. Always use this skill before
  building an account plan from scratch, and always cite sources in the output.
---

# Account Expansion Plan Generator

Produces a single-file, Plative-branded account expansion plan for one customer,
combining Salesforce, Monid, web research, and the rep's own email/calendar/meeting
history. The rep supplies only the account name (and, if there are multiple matches,
picks one from a short list). Everything else is pulled and synthesized.

Output is one .pptx with three slides:
1. The one-pager (matches the reference template exactly)
2. Contact & Relationship Map (full engaged-vs-not breakdown)
3. Sources & Methodology (what came from where)

---

## Required input

Just the account name. If Salesforce returns more than one Account with a matching or
similar name, list them (Name, City/State, Owner) and ask the rep to pick one before
continuing. Do not guess between two real accounts.

---

## Tools this skill uses

- **Plative Salesforce Prod MCP** (`soqlQueryplatform_sobject_reads`, `getRelatedRecordsplatform_sobject_reads`) — account, project, stakeholder, and plan data
- **Monid** (`monid_discover`, `monid_run`) — firmographics and tech stack via Apollo and Strale
- **web_search / web_fetch** — PE ownership and recent company news, when Salesforce and Monid don't resolve it
- **Gmail, Google Calendar, Fellow, Granola** — the rep's own interaction history with the account's contacts
- **slide-templates** and **plative-brand** skills — for producing the branded .pptx

If any connector isn't available for the rep running the skill, note the gap in the
Sources slide ("Fellow not connected; interaction history is Gmail + Calendar only")
and continue with what's available. Don't block the whole plan on one missing tool.

---

## Step 1 — Resolve the account

```sql
SELECT Id, Name, Website, Industry, NumberOfEmployees, AnnualRevenue, Ownership,
       BillingCity, BillingState, BillingCountry, AccountSource, Size_Global__c,
       Account_Status__c, Primary_PE_Relationship__c, OwnerId,
       Managed_Services_Prob__c, Managed_Services_Packages__c,
       Managed_Services_Start_Date__c
FROM Account
WHERE Name LIKE '%{account_name}%'
```

- One match: proceed.
- Multiple matches: present them and ask the rep to choose.
- Zero matches: try a broader LIKE pattern once; if still nothing, tell the rep no
  matching Salesforce account was found and ask whether to proceed on web/Monid data
  alone (clearly labeled as a prospect profile, not an existing-account plan).

Resolve `OwnerId` to a Name via the User relationship — this is the "Account Owner"
field on the template. If `Primary_PE_Relationship__c` is populated, resolve that
Account's Name too — this is very likely your PE ownership answer directly from CRM
data; confirm it with the web-research step in Step 4 rather than re-deriving it from
scratch.

Check for an existing plan:

```sql
SELECT Id, Executive_Aligned__c, Delivery_Director_Aligned__c, Sales_Director_Aligned__c,
       Associate_Director_Aligned__c, Primary_SE_SC__c, Customer_Champion_POC__c,
       RelationshipStrengths, RelationshipWeaknesses, RelationshipOpportunities,
       RelationshipThreats, AccountChallenges, AccountCompetitors, GTM_overview__c,
       Notes
FROM AccountPlan
WHERE AccountId = '{account_id}'
```

If a plan exists, use its aligned-personnel lookups and SWOT fields as a starting
point and update rather than re-deriving from zero. Note in Sources that this data
came from an existing Account Plan record, not fresh research.

---

## Step 2 — Pull project and delivery data

```sql
SELECT Id, Name, Status__c, Delivery_Manager__c, Line_of_Business__c
FROM Project__c
WHERE Account__c = '{account_id}' AND Status__c = 'In Progress' AND Archived__c = false
```

`Delivery_Manager__c` is a lookup to Account (a Person Account representing the
Plative team member), not User. Resolve its Name — this is the "Delivery Leader"
field on the template.

For Solution Architect, query Stakeholder__c (not Opportunity Team — that field
doesn't reliably carry this role):

```sql
SELECT Contact__c, Project__c, Role_Function__c, Stakeholder_Position__c, Email__c
FROM Stakeholder__c
WHERE Project__c IN ({project_ids}) AND Role_Function__c = 'Solution Architect'
  AND Stakeholder_Position__c = 'Internal'
```

Also pull all projects (not just active) for the account to establish delivery
history depth, used in Step 6's Ongoing Services Play:

```sql
SELECT Id, Name, Status__c, CreatedDate, Line_of_Business__c
FROM Project__c
WHERE Account__c = '{account_id}'
ORDER BY CreatedDate DESC
```

Line of Business values are exactly `Salesforce` and `Netsuite`. Note whether the
account's history is SF-only, NS-only, or both — this drives the Cross-Cloud Play.

Pull the full Contact roster for the account:

```sql
SELECT Id, Name, Title, Email, Phone
FROM Contact
WHERE AccountId = '{account_id}'
```

---

## Step 3 — Fill firmographic and tech-stack gaps with Monid

Salesforce may already have Website, Industry, NumberOfEmployees, AnnualRevenue,
Billing City/State/Country populated on the Account. Use those first. For anything
blank, or to get "What They Do" and "Current Tech Landscape" (which Salesforce
doesn't store), enrich via Monid:

1. `monid_discover` for a company search endpoint if you don't already have the
   domain (Apollo's `/mixed_companies/search`, searching by company name).
2. `monid_run` with Apollo's `/organizations/enrich`, passing the resolved domain,
   for firmographics, a company description, funding data, and technology tags.
3. If tech-stack detail is thin, run Strale's `/x402/tech-stack-detect` on the
   company's website for a deeper CMS/analytics/CDN/hosting breakdown.

Record which fields came from Salesforce vs. Monid for the Sources slide. Never
overwrite a populated Salesforce field with a Monid value; only fill gaps.

---

## Step 4 — Determine PE ownership

Order of resolution, stop at the first confident answer:

1. `Account.Primary_PE_Relationship__c`, if populated (already resolved in Step 1).
2. `Account.Ownership` (Public / Private / Subsidiary / Other) plus the Apollo
   funding data pulled in Step 3 — funding rounds or an investor list there often
   name the firm directly.
3. Web search: `"{company name}" acquired by` and `"{company name}" portfolio
   company`, checking recent (last 24 months) results first.

Write exactly one of: the PE firm's name, "Public", or "Private" (no PE/VC backing
found). Cite whichever source resolved it.

---

## Step 5 — Map contacts and relationship strength

Goal: for every contact who matters at this account, show whether Plative is
actually engaging them, and how strongly.

1. Start from the Salesforce Contact roster (Step 2).
2. For each contact's email domain (or the account's Website domain), check the
   rep's own Gmail and Google Calendar for messages and meetings in the trailing
   90 days. Use domain-based search for Gmail; for Calendar, match attendee emails.
3. Check Fellow (`search_meetings` by company name, then `get_meeting_participants`)
   and Granola (`list_meetings` / `query_granola_meetings` by account name) for the
   same window.
4. Also do a light web/LinkedIn-style check (via web_search, industry + title,
   e.g. "{company} VP Operations") for stakeholder roles that matter for this deal
   type but don't appear anywhere in Plative's systems yet — these are the "who we
   need to be talking to" gaps.

Classify every contact:

| Label | Criteria |
|---|---|
| **Strong** | 3+ interactions (email/meeting/call) across any two channels in the last 60 days |
| **Moderate** | 1-2 interactions in the last 90 days, or steady but single-channel contact |
| **Weak** | In Salesforce, but no interaction found in the last 90 days |
| **Not Yet Engaged** | Identified as relevant (role/title) but not in any Plative system and no interaction found |

Present this as: Engaged Now (Strong/Moderate) / Cooling (Weak) / Need to Engage
(Not Yet Engaged), each with name, title, and the evidence for the label (e.g. "3
emails + 1 meeting, last touch 14 days ago" or "no record found").

---

## Step 6 — Build the three strategic plays

**Cross-Cloud Play** — If the account's project history (Step 2) is SF-only,
build the case for a NetSuite entry point (financial complexity signals: multi-
entity structure, revenue recognition needs, industry norms for ERP replacement).
If NS-only, build the reverse case for Salesforce (CRM/sales process maturity,
customer experience gaps). If already both, note the account is fully penetrated
and suggest depth (additional clouds/modules) instead. Ground this in the
company's actual industry and size, not a generic pitch.

**AI Play** — Recommend specific Agentforce, Claude, or agentic use cases based on
the account's industry, current tech stack (Step 3), and existing Salesforce/
NetSuite footprint (Step 2). Pull from the `plative-salesforce-positioning` or
`plative-netsuite-positioning` skill (matching the account's primary LoB) for
consistent, on-brand use case framing rather than generic AI ideas.

**Ongoing Services Play** — Use delivery history depth (Step 2: number and
recency of past projects) plus `Managed_Services_Prob__c`,
`Managed_Services_Packages__c`, and `Managed_Services_Start_Date__c` from Account
to recommend Innovate (net-new project work), Managed Services (ongoing support),
or Staff Augmentation (resource gap-filling), with the reasoning stated, not just
the label.

---

## Step 7 — Produce the output

Read the `slide-templates` and `plative-brand` skills before building. Produce one
.pptx:

- **Slide 1**: the one-pager, matching the uploaded reference template layout
  exactly (Overview, Ownership, badges, What They Do, Current Tech Landscape,
  Who's Who — top contact per role only, three strategic-play cards).
- **Slide 2**: Contact & Relationship Map — every contact from Step 5, grouped by
  Engaged Now / Cooling / Need to Engage, with evidence.
- **Slide 3**: Sources & Methodology — a running log built during Steps 1-6.
  Every non-obvious fact needs a source tag: which Salesforce object/field, which
  Monid provider/endpoint, which web source (with date), or which of the rep's own
  tools (Gmail/Calendar/Fellow/Granola) surfaced it. Group by section of the
  one-pager so it's scannable.

Follow Plative brand colors and typography per the `plative-brand` skill. No
accent lines under titles. Footer: "PLATIVE CONFIDENTIAL" and slide numbers on
every slide.

---

## Quality checklist

Before presenting the file, verify:

1. Account was disambiguated if multiple Salesforce matches existed
2. Account Owner, Solution Architect (from Stakeholder__c), and Delivery Leader
   (from Project__c.Delivery_Manager__c) are all resolved to names, not IDs
3. Existing AccountPlan data was used and extended if a plan record existed
4. Every Overview field states its source (Salesforce or Monid) internally, even
   though only the Sources slide shows this to the rep
5. PE Ownership is exactly a firm name, "Public", or "Private" — nothing hedged
6. Contact map covers every Salesforce contact, not just the ones with activity
7. All three strategic plays are grounded in this account's actual data, not
   generic boilerplate
8. Sources slide has no unattributed claims
9. Any missing connector (Fellow, Granola, etc.) is noted, not silently skipped
