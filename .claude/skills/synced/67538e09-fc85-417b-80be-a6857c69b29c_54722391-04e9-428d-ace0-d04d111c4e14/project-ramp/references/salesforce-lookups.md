# Salesforce Lookup Reference — Project Ramp

SOQL patterns for look-alike project queries. Field API names validated against the Plative production org.

---

## Step 1: Detect engagement signals from the parsed KT

Extract these values from the parsed KT document before querying:

| Signal | Where in KT | Salesforce field |
|---|---|---|
| Platform | §1 Header or §2 | `Line_of_Business__c` — "Netsuite" or "Salesforce" |
| Vertical | §3 Client Profile | `Account_Vertical__c` |
| Market segment | §2 or §3 | `Market_Segment__c` |
| Primary scope modules | §4 Scope | `OpportunityLineItem.Name` |
| Project rank | §1 Header | `Project_Rank__c` |
| Account tier | §1 Header | `Account_Tier__c` |
| Billing type | §9 Licensing | `Billing_Type__c` |
| Timeline | §4 or §9 | `Timeline__c` |

If a signal can't be extracted from the KT, omit it from the query rather than guessing.

---

## Step 2: Look-alike query

**Tier 1 — strongest match (vertical + platform):**

```soql
SELECT Id, Name, Account.Name, Account_Vertical__c, Market_Segment__c,
       Project_Rank__c, Account_Tier__c, Timeline__c, Billing_Type__c,
       CloseDate, Owner.Name, Opportunity_Number__c,
       PSA_Google_Folder_Link__c, Synopsis__c
FROM Opportunity
WHERE StageName = 'Closed Won'
  AND Line_of_Business__c = '[detected platform]'
  AND Account_Vertical__c = '[client vertical]'
  AND CloseDate >= LAST_N_YEARS:3
ORDER BY CloseDate DESC
LIMIT 10
```

**Tier 2 — broaden to segment (if Tier 1 < 2 results):**

```soql
SELECT Id, Name, Account.Name, Account_Vertical__c, Market_Segment__c,
       Project_Rank__c, Account_Tier__c, Timeline__c, Billing_Type__c,
       CloseDate, Owner.Name, Opportunity_Number__c,
       PSA_Google_Folder_Link__c, Synopsis__c
FROM Opportunity
WHERE StageName = 'Closed Won'
  AND Line_of_Business__c = '[detected platform]'
  AND Market_Segment__c = '[client segment]'
  AND CloseDate >= LAST_N_YEARS:3
ORDER BY CloseDate DESC
LIMIT 10
```

**Tier 3 — platform only (if Tier 2 < 2 results):**

```soql
SELECT Id, Name, Account.Name, Account_Vertical__c, Market_Segment__c,
       Project_Rank__c, Account_Tier__c, Timeline__c, Billing_Type__c,
       CloseDate, Owner.Name, Opportunity_Number__c,
       PSA_Google_Folder_Link__c, Synopsis__c
FROM Opportunity
WHERE StageName = 'Closed Won'
  AND Line_of_Business__c = '[detected platform]'
  AND CloseDate >= LAST_N_YEARS:3
ORDER BY CloseDate DESC
LIMIT 10
```

---

## Step 3: Fetch module breakdown per candidate

For each candidate ID returned from the look-alike query:

```soql
SELECT Name, Quantity, UnitPrice FROM OpportunityLineItem
WHERE OpportunityId = '[id]'
```

Use the module names (e.g. "Financial Management", "Order to Cash", "SuiteProjects") to:
1. Rank candidates by overlap with the current project's confirmed modules from §4
2. Populate the module chips in the look-alike card

---

## Step 4: Rank and select top 3-4

Score each candidate (higher = better match):

| Condition | Points |
|---|---|
| Same `Account_Vertical__c` | +3 |
| Overlapping `OpportunityLineItem` module | +2 per overlap (max +6) |
| Same `Project_Rank__c` | +2 |
| Same `Market_Segment__c` | +1 |
| Same `Billing_Type__c` | +1 |
| Timeline within same bracket (e.g. both 30-45 weeks) | +1 |

Take the top 3-4 by score. Break ties by `CloseDate DESC` (most recent first).

---

## Mid-engagement additional signals

In mid-engagement mode, apply these additional scoring weights after the base score:

| Condition | Points |
|---|---|
| Same Delivery Manager (`Delivery_Manager_Act__c` match) | +2 |
| Go-live confirmed (closed + project in `Closed Won` with go-live date populated) | +1 |
| Similar project duration (within 10 weeks of current project timeline) | +1 |

For mid-engagement look-alike cards, the "Why similar" note should reference delivery phase and execution context where available — not just pre-sale match signals.

---

## Fields to suppress in look-alike cards

Never surface these fields in the artifact:
- `Amount` / `ExpectedRevenue` (exact deal value)
- `Hourly_Rate_Final__c` / `Rate_if_only_Hourly_Billing__c`
- `Deposit_*`, `Payment_Plan__c`
- Commission-related fields
- `Total_Billable_Hours__c` (if it implies effective rate)

Safe to show: `Project_Hours__c` (total hours) is acceptable as a proxy for project size if no dollar figure is implied.

---

## Field API name reference

| Display label | API name | Object |
|---|---|---|
| Platform | `Line_of_Business__c` | Opportunity |
| Vertical | `Account_Vertical__c` | Opportunity |
| Market segment | `Market_Segment__c` | Opportunity |
| Project rank | `Project_Rank__c` | Opportunity |
| Account tier | `Account_Tier__c` | Opportunity |
| Timeline | `Timeline__c` | Opportunity |
| Billing type | `Billing_Type__c` | Opportunity |
| Opportunity number | `Opportunity_Number__c` | Opportunity |
| Presales folder | `PSA_Google_Folder_Link__c` | Opportunity |
| Deal synopsis | `Synopsis__c` | Opportunity |
| Delivery Manager | `Delivery_Manager_Act__c` | Opportunity |
