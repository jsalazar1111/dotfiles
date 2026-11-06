# Salesforce Field Reference

Everything here was validated against a real Plative production Opportunity (Arcadia Publishing, a NetSuite implementation). Field API names in this org are not guessable — several differ from the obvious guess, and a few live on child objects rather than the Opportunity itself. Use the patterns below rather than inventing field names.

## Query strategy

**Start with SOSL, not SOQL.** For the initial client-name lookup, a SOSL `FIND` across objects tolerates partial and misspelled names far better than a SOQL `WHERE Name LIKE`. Only switch to targeted SOQL once you have the Opportunity Id.

Initial search:
```
FIND {ClientName*} IN Name FIELDS RETURNING
  Opportunity(Id, Name, StageName, Amount, CloseDate, Owner.Name, Account.Name),
  Account(Id, Name, Industry)
```

This routinely returns multiple candidates (parent account, similarly-named deals, unrelated opportunities that mention the client). Disambiguate with the user before proceeding.

**Enumerate fields before targeting them.** Custom field API names cannot be reliably guessed (the Solution Architect isn't a field at all; Delivery Manager is `Delivery_Manager_Act__c`, not `Delivery_Manager__c`). To see the real fields on a record, run `FIELDS(ALL)` on the known Id:
```
SELECT FIELDS(ALL) FROM Opportunity WHERE Id = '<id>' LIMIT 1
```
Then pull what you need in a targeted query.

## Lookup ID prefixes in this org

When resolving a lookup field's ID to a name, the 3-character prefix tells you which object to query. Notably, the `Delivery_Manager_Act__c` value carries a `0013m` prefix, which resolves against **Account**, not User or Contact — an org-specific quirk. If a lookup resolves to zero rows, try the other objects (Account / Contact / User) before assuming it's empty.

## Field-to-section mapping

### Header
| Document field | Source | Notes |
|---|---|---|
| Client Name | `Account.Name` | |
| Client Partner | `Owner.Name` | The Opportunity Owner *is* the Client Partner — confirmed mapping. |
| Solution Architect | `OpportunityTeamMember.User.Name` where `TeamMemberRole = 'Pre-Sales Consultant'` | NOT a field on the Opportunity. Query the child object. |
| Delivery Manager | `Delivery_Manager_Act__c` | Lookup; resolves against Account in this org (0013m prefix). |
| Account Tier | `Account_Tier__c` | e.g. "1 - Strategic" |
| Project Rank | `Project_Rank__c` | e.g. "B - Med Value/Complexity" |
| Intended Start Date | `Intended_Start_Date__c` | |
| Opportunity Number | `Opportunity_Number__c` | e.g. "2025-12908" |

To get the Solution Architect:
```
SELECT UserId, User.Name, TeamMemberRole FROM OpportunityTeamMember
WHERE OpportunityId = '<id>'
```

### Executive Summary
- `Synopsis__c` — rich-text deal summary; strong seed for this section (strip HTML).
- `Market_Segment__c` — e.g. "Mid-Market / Corporate"
- `Account_Vertical__c` — e.g. "Advertising/Media/Agency"
- `Account.Website`, `Account.BillingCity`, `Account.BillingState`
- `Amount`, `CloseDate`, `StageName`

### Client Profile & Deal Context
- `Account.Website` → triggers the automatic web-research pass.
- `Mutual_Close_Plan__c` — a dated, chronological log of the entire deal (every demo, call, milestone). This is the "why we won / deal narrative" already written down, and doubles as a map of which meetings mattered when reading transcripts.
- `LeadSource` — how the deal originated (e.g. "NetSuite Employee").
- `SI_Competition__c` / `Is_There_Platform_Competition__c` — competitive backdrop; often "We dont know", which means don't fabricate a competitive story.

### Scope, Goals & Explicit Exclusions
- `Out_of_Scope_and_Road_Map__c` — verbatim exclusions list; pull directly, this is gold for preventing scope-creep fights.
- `Assumptions__c` — client responsibilities and assumptions (data migration ownership, license procurement, UAT, etc.).
- `Timeline_Calculation__c` / `Timeline__c` — e.g. "41 weeks - 49 weeks".
- `OpportunityLineItem` records — the full scope breakdown (Discovery & Design, Financial Management, Order to Cash, Procure to Pay, Data Loading, UAT, Training, PM, Custom Objects, Ad-Hoc Configuration, etc.):
```
SELECT Name, Quantity, UnitPrice, TotalPrice FROM OpportunityLineItem
WHERE OpportunityId = '<id>'
```

### Platform detection
- `Line_of_Business__c` — e.g. "Netsuite" or "Salesforce". Primary signal for auto-detecting the engagement type. The scope line items corroborate it.

### Stakeholders
- Primary contact: `Primary_Contact__c` / `Project_Primary_Contact__c`, plus the `OpportunityContactRole` child (role, IsPrimary).
```
SELECT Contact.Name, Contact.Title, Contact.Email, Role, IsPrimary
FROM OpportunityContactRole WHERE OpportunityId = '<id>'
```
- **Reliability warning:** Salesforce usually holds only the primary contact — one person, sometimes. In the validated case, 1 of 5 real stakeholders was in Salesforce. The transcripts are the authoritative stakeholder source. Treat Salesforce contacts as a starting seed, never the complete map.

### Licensing & Delivery-Relevant Commercial Terms
- `Billing_Type__c` — e.g. "Time and Materials" (drives how delivery handles change orders).
- `Rate_if_only_Hourly_Billing__c` / `Hourly_Rate_Final__c` — blended rate.
- `Project_Hours__c` / `Total_Billable_Hours__c` — total hours.
- Licensing/modules come primarily from the SOW and line items; flag anything unconfirmed as `NEEDS INPUT`.
- **Deliberately excluded from the document:** `Amount`/`ExpectedRevenue` (exact deal value), commission fields, `Payment_Plan__c`/`Deposit_*` (payment schedule). These don't change how delivery does the work.

### Links & Source Index
- `SOW_POW_CO_Link__c` — direct link to the signed SOW (may also surface change orders — confirm the authoritative one).
- `MSA_Link__c` — MSA link.
- `PSA_Google_Folder_Link__c` — the presales/project Drive folder; default source for Step 2.
