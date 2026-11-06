# Record to Report — Discovery Questions

*Source: Discovery Questions Combined (NetSuite implementation discovery bank)*


## Company Structure

- What is your legal entity/subsidiary structure? Please outline all entities, the entity hierarchy, names, country, and base currency, as well as a description of the entity and business activities occurring within each entity (i.e. parent, corporate, operating, holding, etc.)
- Are you transacting in multiple currencies? If so, which currencies. Do you desire automated daily exchange rate integration within NS?
- What is your fiscal period structure? (i.e. calendar months, 4-5-4, other) Please specify for each legal entity/subsidiary. Do you currently have or desire use of a 13th period for fiscal year end close adjustments?
- What day does your fiscal year end? (i.e. December 31) Please specify for each legal entity/subsidiary.
- What dimensions or financial segments are used in reporting and planning? (i.e. NS default segments are Subsidiary, Department, Location, Class; Custom Segments can be configured if required)

## Accounting Books

- Do you require multiple accounting books for reporting to different accounting standards? (i.e. US GAAP vs. IFRS) Generally this only applies to companies operating in multiple countries.

## International Localization

- If you have entities in multiple countries with local tax or other reporting requirements, please describe your expectations and requirements for each country. Do you require local tax or invoice e-filing in any local countries or jurisdictions?

## Chart of Accounts

- Do you have GL account numbering today? If so, please describe your current GL and Subledger numbering schema and any segmentation held within? (i.e. 0000-00-00 with descriptions, names only)
- Do you require any statistical GL accounts for reporting on non-financial metrics that may be used to drive dynamic expense allocations, KPI analysis, or other reporting (i.e. Headcount per Department, Square Footage per Location, etc.)? If so, please list and describe each required statistical account and the intended purpose.
- Please share your thoughts on the quality of your current state Chart of Accounts. When was the last time you did an overhaul of the COA? How much clean-up do you feel is required? If you have multiple subsidiaries/business units, do you have a unified COA or is consolidation required? Who on your team will be responsible for the design and approval of the future-state COA structure?

## Banking, CC, Check Printing

- How many bank accounts and Credit Cards do you have? Please list all accounts and financial institutions. How and at what frequency are these accounts reconciled today? How and how often would you like them to be reconciled in the future? What challenges in reconciliation exist today?
- Will you use NetSuite for check printing? Do you have pre-printed check stock or are you open to buying new check stock?
- You can use NetSuite to print two types of checks:
    - ●      Standard – printed without a voucher, three checks per 8.5 x 11 inch sheet.
    - ●      Voucher – printed at the top of an 8.5 x 11 inch sheet with voucher information printed at the bottom, one check per sheet.
- You must print the check at the top. NetSuite does not support printing checks in the middle of the page.
- We recommend www.netsuiteforms.com for purchasing check stock. The following are compatible with NS:
    - ●      Laser Top Multipurpose Check (DNL208)
    - ●      Laser Top Multipurpose Check - Unlined (DNL200)
    - ●      Laser 3-Up Multipurpose Check - Unlined (DNL201)
    - ●      Laser 3-Up Multipurpose Checks w/Lines Product (DNL202)

## Period Close

- When is the typical period close process initiated and completed? What is the latency in days to close the books each period? Describe the steps to close the books, and provide your period close checklist if you have one.

## Sales Tax

- In what countries do you charge sales taxes/VAT? Within the US, what states do you charge sales tax / have nexus? Do you intend for NS to calculate taxes or will you be using a third-party service for tax calculation and/or filing (i.e. Avalara, Vertex, TaxJar)? Are all of your products taxable in all locations, or are there requirements for tax schedules on items to identify in which states/jurisdictions they are/are not taxable? (i.e. Class A of products is taxable in all states except PA) Are any of your products subject to special taxation or charges in any locations?

## Fixed Asset Management

- Do you require tracking fixed assets in NetSuite? How many active/in-service assets (depreciating, fully depreciated) do you have? What asset types? What method(s) do you use for depreciation (i.e. straight line, double declining balance, etc.)? Do you require tax depreciation methods separate from book depreciation methods? Please provide a sample of your current fixed asset ledger. Do you require lease accounting for fixed assets (per IFRS 16 and ASC 842)?

## Core NetSuite Budget Management

- How and when are your Annual budgets constructed and reviewed today? Please describe the sequence of events in the end-to-end process.
- At what frequency and for what range are you budgeting? (i.e. quarterly, annually) Would you like to load multiple versions of the budget into the ERP?
- What tools or software is leveraged, if any, in the budgeting and planning process? (i.e. FP&A software, excel, email, etc.)
- What reporting requirements do you have around budgeting, budget vs. actual, etc.?

## Org Structure, Roles, Approvals

- Describe the team structure in Finance and Accounting, including name, title, supervisor, tenure with the company, prior ERP/accounting system experience, and assigned project role (sponsor, project manager, process owner, power user, and/or end user).
- What approval process is required around Journal Entries? Can this be a role-based approval process (i.e. CFO approves all JEs) or does it require more complexity or business logic?
- What are your future state requirements for security, roles, permissions, and workflows for GL functionality?

## Financial Statements

- Please describe your current reporting requirements and priority metrics for financial statements and budget reporting.
- What additional reporting do you require for the future state and for what purposes? (i.e. investors, board, books delivered to outside parties, etc.)

## Historical Data Conversion

- Please describe expectations for Historical Data migration for GL data? Generally we migrate historical trial balances for prior full fiscal year and fiscal year to date, segmented by Subsidiary, Department, Location, and Class if available. Is this an agreeable approach or do you have other requirements?
    - - What HCM/HRIS/Payroll System(s) are used today across the company? How and at what frequency do you post payroll to your General Ledger today, and at what level of detail? Is this automated today? Would you like this automated as part of this phase of implementation or prefer to start with CSV file import from a memorised mapping?

## Sample Documents Request

- Please provide current-state samples of the following:
    - -     Chart of Accounts file(s)
    - -     Budget file(s)
    - -     Financial Statements (I/S, B/S, CF)
    - -     Payroll export for import to GL
    - -     Period/month-end close checklist
    - -     Fixed Asset ledger file(s)
    - -     List of all reports required for mapping to NS
    - -     VOIDED check stock copy for check printing formatting consideration
    - -     Sample(s) of formatting for critical and unique reporting requirements
    - -     Finance & Accounting Team Org Chart/Matrix with individual Contact Information
- These can be shared either via our project GSuite repository, your NS file cabinet, or via another secure document sharing service of your choice.

## Anything missing?

- Are there any unique requirements or expectations that you have which have not been discussed or questioned above?
    - ●  Please share your feedback on this questionnaire, we are always trying to improve our approach!
