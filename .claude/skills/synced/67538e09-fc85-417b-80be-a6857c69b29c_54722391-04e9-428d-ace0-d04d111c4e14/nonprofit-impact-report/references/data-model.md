# Nonprofit Cloud Data Model Reference

> **All field names in this document are verified against the live Salesforce NFP Accelerator SDO environment (June 2026).**

## Table of Contents

1. [Object Overview & Relationships](#1-object-overview--relationships)
2. [Object: Program](#2-object-program)
3. [Object: ProgramEnrollment](#3-object-programenrollment)
4. [Object: Account (Participant)](#4-object-account-participant)
5. [Object: Benefit](#5-object-benefit)
6. [Object: BenefitAssignment](#6-object-benefitassignment)
7. [Object: BenefitDisbursement](#7-object-benefitdisbursement)
8. [Relationship Map & Join Logic](#8-relationship-map--join-logic)
9. [SOQL Patterns & Anti-Patterns](#9-soql-patterns--anti-patterns)
10. [Metric Interpretation Guide](#10-metric-interpretation-guide)
11. [Field Value Vocabularies](#11-field-value-vocabularies)
12. [Data Quality Assessment Checklist](#12-data-quality-assessment-checklist)

---

## 1. Object Overview & Relationships

```
Program (1)
    └── ProgramEnrollment (many)          ← one per participant per program
            └── Account (1)               ← the participant (Person Account)
            └── BenefitAssignment (many)  ← services assigned to this enrollment
                    └── Benefit (1)       ← the service catalog entry
    └── BenefitDisbursement (many)        ← direct link; also links to BenefitAssignment
            └── BenefitAssignment (1)
```

**Key principle**: ProgramEnrollment is the bridge between participant (Account) and program (Program). BenefitDisbursement has a **direct `ProgramEnrollmentId` field** — use it to filter disbursements by program without traversing through BenefitAssignment.

---

## 2. Object: Program

**API Name:** `Program`
**Purpose:** Top-level program definition, dates, status, and narrative context.

### Verified Fields

| Label | API Name | Type | Notes |
|---|---|---|---|
| Program ID | `Id` | ID | Auto-generated |
| Name | `Name` | String (255) | Program identifier |
| Program Description | `Program_Description__c` | Textarea (1500) | Main description — use in Program Overview section |
| Status | `Status` | Picklist | **No `__c` suffix.** Values: Active / Planned / Completed / Cancelled |
| Start Date | `StartDate` | Date | **No `__c` suffix.** Report period start |
| End Date | `EndDate` | Date | **No `__c` suffix.** Report period end; NULL = ongoing |
| Summary | `Summary` | String (100) | Short description |
| Additional Context | `AdditionalContext` | Textarea (5000) | Extended narrative; use as supplement to `Program_Description__c` |
| Program Type | `ProgramType` | Picklist | **No `__c` suffix.** |
| Active | `IsActive` | Boolean | Whether program is currently active |
| Active Enrollee Count | `ActiveEnrolleeCount` | Number | Salesforce-maintained rollup of active enrollments |
| Total Enrollee Count | `TotalEnrolleeCount` | Number | Salesforce-maintained rollup of all enrollments |

### Fields That Do NOT Exist
- ~~`Description`~~ → use `Program_Description__c`
- ~~`Status__c`~~ → use `Status`
- ~~`Start_Date__c`~~ → use `StartDate`
- ~~`End_Date__c`~~ → use `EndDate`
- ~~`Program_Goal__c`~~ → no equivalent; use `AdditionalContext` or `Summary`
- ~~`Target_Population__c`~~ → does not exist
- ~~`Program_Type__c`~~ → use `ProgramType`

### Verified Query

```soql
SELECT Id, Name, Program_Description__c, Status, StartDate, EndDate,
       Summary, ProgramType, AdditionalContext, IsActive,
       ActiveEnrolleeCount, TotalEnrolleeCount
FROM Program
WHERE Name LIKE '%[program name]%'
LIMIT 5
```

---

## 3. Object: ProgramEnrollment

**API Name:** `ProgramEnrollment`
**Purpose:** One record per participant per program. Tracks when they joined, their current status, and when they exited.

### Verified Fields

| Label | API Name | Type | Notes |
|---|---|---|---|
| Program Enrollment ID | `Id` | ID | Auto-generated |
| Name | `Name` | String (255) | Auto-generated |
| Status | `Status` | Picklist | Applied / Denied / Waitlisted / In Progress / Completed / Withdrawn |
| Start Date | `StartDate` | Date | **Not `EnrollmentDate`.** Participant entry date |
| End Date | `EndDate` | Date | **Not `ExitDate`.** NULL if still active |
| Application Date | `ApplicationDate` | Date | When participant applied (pre-enrollment) |
| Program | `ProgramId` | Lookup (Program) | Parent program — always filter on this |
| Account | `AccountId` | Lookup (Account) | The participant |
| Contact | `ContactId` | Lookup (Contact) | Contact record if using Contact-based enrollment |
| Is Active | `IsActive` | Boolean | Whether enrollment is active |
| Is Anonymous | `IsAnonymous` | Boolean | Whether participant is recorded anonymously |

### Fields That Do NOT Exist
- ~~`EnrollmentDate`~~ → use `StartDate`
- ~~`ExitDate`~~ → use `EndDate`
- ~~`ExitReason`~~ → does not exist on this object
- ~~`CohortTrack__c`~~ → does not exist on this object

### Enrollment Status Values
- `Applied` — submitted but not yet reviewed (default)
- `Denied` — application rejected
- `Waitlisted` — approved but waiting for capacity
- `In Progress` — actively enrolled and participating
- `Completed` — successfully finished the program
- `Withdrawn` — left before completion

**For impact reporting:** count `In Progress` + `Completed` as "served." Count `Withdrawn` separately for attrition analysis.

### Verified Query

```soql
SELECT Id, Name, Status, StartDate, EndDate, ApplicationDate,
       ProgramId, AccountId, IsActive,
       Account.Name, Account.PersonBirthdate,
       Account.PersonGender, Account.Ethnicity__c,
       Account.PersonMailingCity, Account.PersonMailingState
FROM ProgramEnrollment
WHERE ProgramId = '[PROGRAM_ID]'
ORDER BY StartDate ASC
```

---

## 4. Object: Account (Participant)

**API Name:** `Account`
**Purpose:** Participant profile. Person Accounts are used for individual participants.

### Verified Fields for Impact Reporting

| Label | API Name | Type | Notes |
|---|---|---|---|
| Account ID | `Id` | ID | Auto-generated |
| Name | `Name` | String | Full name |
| Birthdate | `PersonBirthdate` | Date | Convert to age ranges — never report raw birthdates |
| Gender | `PersonGender` | Picklist | **Standard Person Account field — not `Gender__c`.** Values: Male / Female / Other / Unknown |
| Ethnicity | `Ethnicity__c` | Picklist | **Custom field — not `Race_Ethnicity__c`.** Values: White / Black / Asian / Indigenous / Hispanic-Latino / Mixed Race / Middle Eastern / South/East/Southeast Asian / Pacific Islander / Other / Prefer Not to Disclose |
| Mailing City | `PersonMailingCity` | String | Geographic reach |
| Mailing State | `PersonMailingState` | String | Geographic reach |
| Is Person Account | `IsPersonAccount` | Boolean | Use to filter Person Accounts from org Accounts if needed |

### Fields That Do NOT Exist (as assumed)
- ~~`Gender__c`~~ → use `PersonGender`
- ~~`Race_Ethnicity__c`~~ → use `Ethnicity__c`

### Age Range Calculation

Convert `PersonBirthdate` to age ranges. Never report raw birthdates:
- Under 5
- 5–12
- 13–17 (Youth)
- 18–24 (Young Adult)
- 25–44 (Adult)
- 45–64 (Older Adult)
- 65+

---

## 5. Object: Benefit

**API Name:** `Benefit`
**Purpose:** The service catalog. Each record is a type of service the program offers.

### Verified Fields

| Label | API Name | Type | Notes |
|---|---|---|---|
| Benefit ID | `Id` | ID | Auto-generated |
| Benefit Name | `Name` | String (255) | Service label |
| Description | `Description` | Textarea (1000) | Service definition |
| Benefit Status | `BenefitStatus` | Picklist | Active / Planned / Completed / Cancelled |
| Value | `Value` | Number | Monetary value if applicable |
| Unit of Measure | `UnitId` | Lookup (UnitOfMeasure) | **Not `UnitType__c`.** Links to a UnitOfMeasure record for quantity interpretation |
| Payout Frequency | `PayoutFrequency` | Picklist | Weekly / Bi-Weekly / Monthly / Quarterly / Annual / On-Demand |
| Program | `ProgramId` | Lookup (Program) | Links benefit to program |
| Is Active | `IsActive` | Boolean | Whether benefit is active |

### Fields That Do NOT Exist
- ~~`Category__c`~~ → use `BenefitCategory` on BenefitDisbursement for service grouping
- ~~`UnitType__c`~~ → use `UnitId` (lookup to UnitOfMeasure object)

### Note on Service Grouping
There is no category field on Benefit. Use the `BenefitCategory` picklist on **BenefitDisbursement** (Monetary / Goods / Services) to group service delivery by type.

### Verified Query

```soql
SELECT Id, Name, Description, BenefitStatus, IsActive, ProgramId,
       PayoutFrequency, Value
FROM Benefit
WHERE ProgramId = '[PROGRAM_ID]'
```

---

## 6. Object: BenefitAssignment

**API Name:** `BenefitAssignment`
**Purpose:** The formal assignment of a specific benefit to a specific program enrollment. Represents eligibility and intent.

### Verified Fields

| Label | API Name | Type | Notes |
|---|---|---|---|
| Benefit Assignment ID | `Id` | ID | Auto-generated |
| Name | `Name` | String (255) | Auto-generated |
| Benefit | `BenefitId` | Lookup (Benefit) | Which service was assigned (required) |
| Parent Record | `ParentRecordId` | Lookup | Required — links to ProgramEnrollment or other parent |
| Program Enrollment | `ProgramEnrollmentId` | Lookup (ProgramEnrollment) | Direct link to enrollment |
| Enrollee | `EnrolleeId` | Lookup (Account/Contact) | The participant |
| Assignment Date | `AssignmentDate` | Date | **Not `AssignedDate__c`.** When benefit was assigned |
| Status | `Status` | Picklist | **Not `Status__c`.** Enrolled / Active / Waitlisted / Completed / Withdrawn |
| Quantity | `Quantity` | Integer | Quantity assigned |
| Start Date Time | `StartDateTime` | Datetime | Assignment start |
| End Date Time | `EndDateTime` | Datetime | Assignment end |

### Fields That Do NOT Exist
- ~~`AssignedDate__c`~~ → use `AssignmentDate`
- ~~`Status__c`~~ → use `Status`

### Verified Query

```soql
SELECT Id, Name, BenefitId, Benefit.Name, Benefit.BenefitStatus,
       ProgramEnrollmentId, ProgramEnrollment.Account.Name,
       AssignmentDate, Status, Quantity
FROM BenefitAssignment
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)
ORDER BY AssignmentDate ASC
```

---

## 7. Object: BenefitDisbursement

**API Name:** `BenefitDisbursement`
**Purpose:** The actual delivery record. Each disbursement represents one instance of a service delivered to a participant. This is ground truth for what the program actually did.

### Verified Fields

| Label | API Name | Type | Notes |
|---|---|---|---|
| Benefit Disbursement ID | `Id` | ID | Auto-generated |
| Name | `Name` | String (255) | Auto-generated |
| Benefit Assignment | `BenefitAssignmentId` | Lookup (BenefitAssignment) | Required |
| Program Enrollment | `ProgramEnrollmentId` | Lookup (ProgramEnrollment) | **Direct link — use this to filter by program without deep joins** |
| Recipient | `RecipientId` | Lookup (Account/Contact) | The participant receiving the service |
| Actual Completion Date | `ActualCompletionDate` | Datetime | **Not `DisbursementDate__c`.** When service was delivered. REQUIRED field. |
| Start Date | `StartDate` | Datetime | Service window start |
| End Date | `EndDate` | Datetime | Service window end |
| Disbursed Quantity | `DisbursedQuantity` | Number | **Not `Quantity__c`.** Units of service delivered |
| Benefit Category | `BenefitCategory` | Picklist | **Key grouping field.** Monetary / Goods / Services |
| Disbursement Status | `DisbursementStatus` | Picklist | **Not `Status__c`.** Enrolled / Completed / Excused / Absent |
| Description | `Description` | String (255) | **Not `Notes__c`.** Staff notes or delivery description |
| Payout Amount | `PayoutAmount` | Currency | Monetary value if applicable |
| Unit of Measure | `UnitOfMeasureId` | Lookup (UnitOfMeasure) | **Not `Unit__c`.** |
| Approval Status | `ApprovalStatus` | Picklist | Not Applicable / Pending / In Review / Approved / Rejected |
| Recipient Count | `RecipientCount` | Integer | Group disbursements count |

### Fields That Do NOT Exist
- ~~`DisbursementDate__c`~~ → use `ActualCompletionDate`
- ~~`Quantity__c`~~ → use `DisbursedQuantity`
- ~~`Unit__c`~~ → use `UnitOfMeasureId`
- ~~`Notes__c`~~ → use `Description`
- ~~`Status__c`~~ → use `DisbursementStatus`

### Verified Query

```soql
SELECT Id, Name, BenefitAssignmentId, ProgramEnrollmentId,
       BenefitAssignment.Benefit.Name,
       ProgramEnrollment.Account.Name,
       ActualCompletionDate, DisbursedQuantity,
       BenefitCategory, DisbursementStatus, Description
FROM BenefitDisbursement
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)
AND DisbursementStatus = 'Completed'
ORDER BY ActualCompletionDate ASC
```

### Monthly Trend Query

```soql
SELECT CALENDAR_MONTH(ActualCompletionDate) month_num,
       CALENDAR_YEAR(ActualCompletionDate) year_num,
       BenefitCategory,
       COUNT(Id) disbursements,
       SUM(DisbursedQuantity) units_delivered
FROM BenefitDisbursement
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)
AND DisbursementStatus = 'Completed'
GROUP BY CALENDAR_MONTH(ActualCompletionDate),
         CALENDAR_YEAR(ActualCompletionDate), BenefitCategory
ORDER BY year_num ASC, month_num ASC
```

---

## 8. Relationship Map & Join Logic

### Relationship Paths

```
BenefitDisbursement.ProgramEnrollmentId          ← use this for program-level filters
BenefitDisbursement.BenefitAssignmentId
  → BenefitAssignment.BenefitId
      → Benefit.Name

ProgramEnrollment.AccountId
  → Account.PersonBirthdate
  → Account.PersonGender
  → Account.Ethnicity__c
```

### Efficient Filtering Pattern

Because `BenefitDisbursement` has a direct `ProgramEnrollmentId` field, you can filter disbursements by program using a subquery rather than multi-level dot notation:

```soql
-- Efficient: filter disbursements directly via ProgramEnrollmentId
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)

-- Avoid this deep traversal on large datasets:
-- WHERE BenefitAssignment.ProgramEnrollment.ProgramId = '[PROGRAM_ID]'
```

---

## 9. SOQL Patterns & Anti-Patterns

### Correct Patterns

```soql
-- Always filter by DisbursementStatus = 'Completed'
WHERE DisbursementStatus = 'Completed'

-- Use DisbursedQuantity (not Quantity__c)
SUM(DisbursedQuantity)

-- Use ActualCompletionDate for trend analysis
CALENDAR_MONTH(ActualCompletionDate)

-- Use StartDate/EndDate on ProgramEnrollment (not EnrollmentDate/ExitDate)
WHERE StartDate >= [start] AND EndDate <= [end]
```

### Anti-Patterns — Avoid These

| Anti-Pattern | Correct Approach |
|---|---|
| `SELECT ... FROM ProgramEnrollment WHERE EnrollmentDate ...` | Use `StartDate` |
| `SELECT ExitDate FROM ProgramEnrollment` | Use `EndDate` |
| `SELECT DisbursementDate__c FROM BenefitDisbursement` | Use `ActualCompletionDate` |
| `SELECT Quantity__c FROM BenefitDisbursement` | Use `DisbursedQuantity` |
| `SELECT Status__c FROM BenefitDisbursement` | Use `DisbursementStatus` |
| `SELECT Notes__c FROM BenefitDisbursement` | Use `Description` |
| `SELECT Category__c FROM Benefit` | Use `BenefitCategory` on BenefitDisbursement |
| `SELECT Gender__c FROM Account` | Use `PersonGender` |
| `SELECT Race_Ethnicity__c FROM Account` | Use `Ethnicity__c` |
| `SELECT Status__c FROM BenefitAssignment` | Use `Status` |
| `SELECT AssignedDate__c FROM BenefitAssignment` | Use `AssignmentDate` |

---

## 10. Metric Interpretation Guide

### Enrollment Status for Impact Counting

| Status | Include in "Served"? | Notes |
|---|---|---|
| Applied | No | Not yet enrolled |
| Denied | No | Never enrolled |
| Waitlisted | No | Not yet enrolled |
| In Progress | Yes | Actively participating |
| Completed | Yes | Successfully graduated |
| Withdrawn | Separate metric | Count for attrition analysis |

### BenefitDisbursement Status for Service Metrics

Only `DisbursementStatus = 'Completed'` counts as delivered service:

| Status | Count in Metrics? |
|---|---|
| Completed | Yes |
| Enrolled | No (scheduled) |
| Excused | No (documented absence) |
| Absent | No (unexcused) |

### BenefitCategory Interpretation

`BenefitCategory` on BenefitDisbursement:
- **Monetary** — cash assistance, stipends, vouchers
- **Goods** — food, clothing, supplies, equipment
- **Services** — counseling, tutoring, job coaching, healthcare navigation

Use this field as the primary grouping dimension for service distribution tables.

### Trend Interpretation

| Pattern | Likely Meaning |
|---|---|
| Steady month-over-month growth in completed disbursements | Program scaling normally |
| Sharp spike in final month | End-of-period data entry catch-up |
| Flat disbursements despite enrollment growth | Capacity constraint or supply gap |
| High BenefitAssignment count, low BenefitDisbursement count | Assigned but not delivered — flag as gap |
| Many `Excused` or `Absent` records | Attendance/engagement issue worth noting |

---

## 11. Field Value Vocabularies

### Program.Status
`Active` | `Planned` | `Completed` | `Cancelled`

### ProgramEnrollment.Status
`Applied` | `Denied` | `Waitlisted` | `In Progress` | `Completed` | `Withdrawn`

### Account.PersonGender
`Male` | `Female` | `Other` | `Unknown`

### Account.Ethnicity__c
`White` | `Black` | `Asian` | `Indigenous` | `Hispanic/Latino` | `Mixed Race` | `Middle Eastern` | `South Asian` | `East Asian` | `Southeast Asian` | `Pacific Islander` | `Other` | `Prefer Not to Disclose`

### BenefitAssignment.Status
`Enrolled` | `Active` | `Waitlisted` | `Completed` | `Withdrawn`

### BenefitDisbursement.DisbursementStatus
`Enrolled` | `Completed` | `Excused` | `Absent`

### BenefitDisbursement.BenefitCategory
`Monetary` | `Goods` | `Services`

### Benefit.BenefitStatus
`Active` | `Planned` | `Completed` | `Cancelled`

---

## 12. Data Quality Assessment Checklist

Run after all queries, before drafting the report.

| Check | Field to Examine | Report If |
|---|---|---|
| Missing gender | NULL `PersonGender` on Account | >10% of participants |
| Missing ethnicity | NULL `Ethnicity__c` on Account | >10% of participants |
| Enrollees with no benefits assigned | ProgramEnrollment IDs not in BenefitAssignment | Any count > 0 |
| Benefits assigned but never disbursed | BenefitAssignment IDs not in BenefitDisbursement | >5% of assignments |
| Disbursements with no quantity | NULL or 0 `DisbursedQuantity` | Any count > 0 |
| Completed enrollments with no end date | Status = Completed/Withdrawn AND `EndDate` = NULL | Any count > 0 |
| Future-dated completions | `ActualCompletionDate` > TODAY() with `DisbursementStatus = 'Completed'` | Any count > 0 |
| High absence rate | `DisbursementStatus = 'Absent'` / total disbursements | >20% |

---

*Verified: June 2026 against Salesforce NFP Accelerator SDO (Spring '26)*
