---
name: nonprofit-impact-report
description: "Generate board-ready, funder-worthy nonprofit program impact reports by querying Salesforce Nonprofit Cloud data. Use this skill whenever a user asks to generate an impact report, program summary, funder report, grant report, or board report for a nonprofit program. Also triggers on requests to analyze program reach, participant outcomes, service delivery metrics, enrollment trends, or demographic breakdowns from Salesforce Nonprofit Cloud. Covers the full workflow: Salesforce data extraction via SOQL, data interpretation, narrative generation, multi-audience tailoring (board, donors, institutional funders), PDF attachment to Salesforce records, and social media kit generation. Always use this skill when the user mentions programs, enrollments, benefits, disbursements, or impact metrics in a Salesforce nonprofit context — even if they don't say 'impact report' explicitly."
---

# Nonprofit Impact Report Skill

## Purpose

This skill guides Claude through the full pipeline of generating a professional, board-ready nonprofit impact report from Salesforce Nonprofit Cloud data. It covers how to query the correct objects, which fields carry the most analytical value, how to interpret enrollment and service delivery data, how to structure a compelling report narrative, and how to tailor output for specific funder audiences.

**Read `references/data-model.md` before writing any SOQL queries.** It contains the full object map, verified field names, join logic, and interpretation rules for each metric type.

---

## Workflow Overview

Three discrete workflows. **Workflow 1 always runs first.** Workflows 2 and 3 only run when the user explicitly requests them.

| Workflow | Trigger | What Happens |
|---|---|---|
| **1. Data Extraction & Draft** | "Generate an impact report for [Program]" | Query Salesforce, analyze data, produce full draft |
| **2. PDF & Salesforce Attach** | "Attach this to Salesforce" / "Save as PDF" | Compile finalized report to PDF, upload to Program record |
| **3. Social Media Kit** | "Generate social media posts" / "Pull stats for posts" | Draft platform-specific content from report metrics |

---

## Workflow 1: Data Extraction & Draft Generation

### Step 1: Identify the Program Record

Before any other query, locate the Program record. Ask the user for the program name if not provided. Then:

```soql
SELECT Id, Name, Program_Description__c, Status, StartDate, EndDate,
       Summary, ProgramType, AdditionalContext
FROM Program
WHERE Name LIKE '%[user-provided name]%'
LIMIT 5
```

Confirm the correct record with the user if multiple results return. Store the `Program.Id` as `[PROGRAM_ID]` for all downstream queries.

**Field notes:**
- `Program_Description__c` is the program description field (custom, 1500 chars)
- `Status` picklist: Active / Planned / Completed / Cancelled
- `StartDate` / `EndDate` are the program period dates (standard, no `__c`)
- `ProgramType` is the program type picklist (standard, no `__c`)
- `Summary` is a 100-char short description field
- `AdditionalContext` is a 5000-char textarea for additional narrative

### Step 2: Pull Enrollment Data

```soql
SELECT Id, Name, Status, StartDate, EndDate,
       Program.Name, Account.Name, Account.PersonBirthdate,
       Account.PersonGender, Account.Ethnicity__c,
       Account.PersonMailingCity, Account.PersonMailingState
FROM ProgramEnrollment
WHERE ProgramId = '[PROGRAM_ID]'
ORDER BY StartDate ASC
```

**Field notes:**
- `StartDate` = enrollment entry date (not `EnrollmentDate`)
- `EndDate` = enrollment exit date (not `ExitDate`)
- `Status` picklist: Applied / Denied / Waitlisted / In Progress / Completed / Withdrawn
- `PersonGender` = standard Person Account field (not `Gender__c`); values: Male / Female / Other / Unknown
- `Ethnicity__c` = custom ethnicity field on Account (not `Race_Ethnicity__c`)
- No `ExitReason` or `CohortTrack__c` fields exist on this object

**Key analytical targets from this query:**
- Total unique enrollees (`COUNT(Id)`)
- Active vs. exited participants (filter `Status` on Completed / Withdrawn)
- Average program tenure: `EndDate - StartDate` where EndDate is populated
- Retention rate: In Progress + Completed / total ever enrolled
- Demographic breakdown: age ranges from `PersonBirthdate`, gender from `PersonGender`, ethnicity from `Ethnicity__c`

### Step 3: Pull Benefit Assignment Data

```soql
SELECT Id, Name, BenefitId, Benefit.Name, Benefit.BenefitStatus,
       Benefit.Description, ProgramEnrollmentId,
       ProgramEnrollment.Account.Name, AssignmentDate, Status
FROM BenefitAssignment
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)
ORDER BY AssignmentDate ASC
```

**Field notes:**
- `AssignmentDate` = date benefit was assigned (not `AssignedDate__c`)
- `Status` picklist: Enrolled / Active / Waitlisted / Completed / Withdrawn (not `Status__c`)
- `Benefit.BenefitStatus` is the benefit catalog status (Active / Planned / Completed / Cancelled)
- No `Category__c` on Benefit — use `BenefitCategory` on BenefitDisbursement for service grouping instead

**Key analytical targets:**
- How many distinct benefit types are assigned across the program
- Which benefits are most frequently assigned (top services)
- Benefit assignment rate: participants with at least one assigned benefit / total enrollees
- Gaps: enrollees with zero benefit assignments (a data quality flag)

### Step 4: Pull Benefit Disbursement Data

```soql
SELECT Id, Name, BenefitAssignmentId,
       BenefitAssignment.Benefit.Name,
       BenefitAssignment.ProgramEnrollment.Account.Name,
       ActualCompletionDate, DisbursedQuantity, BenefitCategory,
       Description, DisbursementStatus, ProgramEnrollmentId
FROM BenefitDisbursement
WHERE ProgramEnrollmentId IN (
    SELECT Id FROM ProgramEnrollment WHERE ProgramId = '[PROGRAM_ID]'
)
ORDER BY ActualCompletionDate ASC
```

**Field notes:**
- `ActualCompletionDate` = when service was delivered (not `DisbursementDate__c`); this is a REQUIRED field
- `DisbursedQuantity` = units of service delivered (not `Quantity__c`)
- `BenefitCategory` = service grouping picklist: Monetary / Goods / Services (not `Category__c`)
- `Description` = notes field (not `Notes__c`; max 255 chars)
- `DisbursementStatus` = delivery status (not `Status__c`); values: Enrolled / Completed / Excused / Absent
- `ProgramEnrollmentId` = direct link to enrollment (no join through BenefitAssignment required)
- Only count `DisbursementStatus = 'Completed'` records in impact metrics

**Key analytical targets:**
- Total service units delivered (SUM of `DisbursedQuantity` grouped by `BenefitCategory`)
- Service delivery cadence: disbursements grouped by month using `ActualCompletionDate`
- Per-participant service intensity: average disbursements per enrolled participant
- Most-delivered service categories (Monetary / Goods / Services breakdown)
- Trend: is delivery volume increasing, stable, or declining over the program period?

### Step 5: Cross-Object Aggregation

After all four queries return, synthesize the following composite metrics:

| Metric | Calculation |
|---|---|
| **Total Participants Served** | COUNT DISTINCT AccountId from ProgramEnrollment |
| **Active Enrollment Rate** | "In Progress" ProgramEnrollments / Total ProgramEnrollments |
| **Avg. Tenure (days)** | MEAN(EndDate - StartDate) for enrollments where EndDate is populated |
| **Benefit Coverage Rate** | Enrollees with ≥1 BenefitAssignment / Total Enrollees |
| **Total Service Units** | SUM(DisbursedQuantity) from BenefitDisbursements where DisbursementStatus = 'Completed' |
| **Avg. Services Per Participant** | Total completed Disbursements / Total Enrollees |
| **Monthly Delivery Trend** | Disbursements grouped by CALENDAR_MONTH(ActualCompletionDate) |

---

## Workflow 1: Report Draft Structure

Produce the report in the following structure. Do not skip sections.

### 1. Executive Summary
- Open with the single most impressive metric or outcome
- 3-5 headline stats in a clean visual block
- One sentence on the program's mission context
- One sentence on what this report period represents

### 2. Program Overview & Reach
- Program description drawn from `Program_Description__c` and `AdditionalContext`
- Population served (demographic synthesis from Account fields)
- Geographic reach if `PersonMailingCity/State` is populated
- Total participants served with an enrollment timeline

### 3. Data Visualizations
Use Markdown tables and structured text elements. Build at least three visual blocks:

**Enrollment Snapshot Table:**
```
| Metric | Value |
|---|---|
| Total Enrolled (All Time) | X |
| Currently In Progress | X |
| Successfully Completed | X |
| Retention Rate | X% |
```

**Monthly Service Delivery Trend (ASCII or table):**
Show disbursement volume by month using `ActualCompletionDate`. Use a simple column or bar-style text chart if month-over-month data supports it.

**Benefit Category Distribution Table:**
Units delivered grouped by `BenefitCategory` (Monetary / Goods / Services).

### 4. Narrative Accomplishments
Write 3-4 paragraphs. Structure:
- **What the program did** (scope and scale, grounded in disbursement data)
- **Who it reached** (demographic context using `PersonGender`, `Ethnicity__c`, age ranges from `PersonBirthdate`)
- **What changed** (participant outcomes, tenure data, status distribution)
- **A human moment** (if qualitative data is available from disbursement `Description` fields, surface an anonymized story arc)

### 5. Forward-Looking Goals
Based on current data gaps, enrollment trends, and benefit coverage rates, propose 3-4 strategic priorities for the next program cycle. Frame these as actionable, specific goals with measurable targets where possible.

---

## Audience Tailoring Rules

After the base draft, always offer to adapt for a specific audience. Use these rules:

### Board of Directors
- Lead with KPIs: retention rate, service units, active enrollment, program cost-per-participant (if available)
- Include strategic alignment: how does program performance track against organizational growth goals?
- Add a risk callout if data shows declining enrollment or benefit coverage gaps
- Tone: analytical, direct, high-level

### Donors & Public Funders
- Lead with the human impact story before introducing numbers
- Emphasize community need and how the program fills a gap
- Use accessible language; avoid field-level jargon
- Add a "your support made this possible" framing
- Tone: warm, mission-driven, evidence-supported

### Institutional Grant Providers / Foundation Program Officers
- Open with compliance-ready metrics: exact participant counts, exact service delivery numbers against grant categories
- Document methodology: explain how enrollment and disbursement data are tracked
- Flag any data completeness issues honestly with a remediation note
- Include outcome-to-grant-objective mapping if the funder has defined categories
- Tone: rigorous, data-forward, transparent

---

## Data Quality Flags

After running queries, always check for and surface the following issues:

| Flag | How to Detect | What to Say |
|---|---|---|
| Missing gender data | NULL values in `PersonGender` on Accounts | "X% of participant records are missing gender data. This limits demographic reporting." |
| Missing ethnicity data | NULL values in `Ethnicity__c` on Accounts | "X% of participant records are missing ethnicity data. Recommend a data cleanup sprint before the next grant cycle." |
| Enrollees with no benefit assignments | ProgramEnrollment records with no child BenefitAssignment rows | "X participants have no recorded benefit assignments. These participants may have received services not captured in the system." |
| Disbursements with no quantity | NULL or zero `DisbursedQuantity` on BenefitDisbursement | "X disbursement records are missing quantity values. Service unit totals may be understated." |
| Missing end dates | `EndDate` NULL on Completed/Withdrawn ProgramEnrollments | "X exited participants have no recorded end date. Retention and tenure calculations are approximate." |

Flag these in a dedicated **Data Quality Notes** section at the end of the report draft. Never suppress data quality issues.

---

## Workflow 2: PDF & Salesforce Attachment

Only execute when the user explicitly says to save, attach, or export.

1. Confirm the finalized report content with the user before compiling
2. Read `/mnt/skills/public/pdf/SKILL.md` before generating the PDF
3. File naming: `[ProgramName]_ImpactReport_[YYYY].pdf`
4. Use a clean cover page: program name, report period, Plative/organization branding
5. Consistent page breaks at each major section
6. Upload to the `Program` record using the `Upload_File_to_Record` tool from the connected Salesforce MCP, passing the Program's `Id` as the record target

---

## Workflow 3: Social Media Kit

Only execute on explicit user request.

Extract the top 5 standalone statistics from the report. Then draft:

**LinkedIn/Facebook (2 posts):**
- 100-150 words each
- Professional tone, organizational voice
- Embed 2-3 key metrics with context
- End with a mission-forward closing line
- No emojis in donor-facing content

**X/Instagram (3 posts):**
- Under 280 characters each
- Lead with the number, follow with the "so what"
- Clean line breaks for scannability
- Suggest 3-4 relevant hashtags per post

---

## Interaction Defaults

After completing the Workflow 1 draft:

1. Present the report
2. Call out any data quality flags explicitly
3. End with this prompt: "Would you like me to adapt this for a specific audience (board, donor, or foundation grant proposal), expand any section, or generate a social media kit from these results?"
4. Do not proceed to PDF generation or social media without explicit instruction

Keep the conversation open. Treat the first draft as a baseline, not a final product.

---

## Constraints

- **Read-only**: Never write, update, or delete records via MCP. Only use query and read tools.
- **No custom object exploration**: Do not search for or use custom objects outside the six core objects (Program, ProgramEnrollment, Account, Benefit, BenefitAssignment, BenefitDisbursement). If a query fails, check field names against the data model reference before trying alternate objects.
- **No financial objects**: Do not query Fund__c, Payment__c, Opportunity, or any financial/donation tracking objects.
- **Anonymize by default**: Use aggregated metrics and anonymized participant references in all external-facing sections. Named participants only in internal board versions and only when the user confirms consent.
- **Confidentiality**: Do not reproduce raw PII (full names, birthdates, addresses) in report output. Use age ranges, not exact ages.

---

## Reference Files

- **`references/data-model.md`**: Full object schema, verified field names, relationship map, SOQL join patterns, and metric interpretation guide. Read this before writing any SOQL queries or interpreting field values.

---

## Version Notes

**Version:** 1.2
**Built:** June 2026
**Updated:** June 2026 (field names corrected against live Salesforce NFP environment)
**Designed for:** Salesforce Nonprofit Cloud (standard objects, Spring '26)
**Companion skills:** `plative-voice` (apply to all written output), `pdf` (Workflow 2), `plative-brand` (cover page design)
