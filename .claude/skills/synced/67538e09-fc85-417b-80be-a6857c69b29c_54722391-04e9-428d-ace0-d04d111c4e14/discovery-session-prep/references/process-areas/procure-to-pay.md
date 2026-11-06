# Procure to Pay — Discovery Questions

*Source: Discovery Questions Combined (NetSuite implementation discovery bank)*


## Vendor Master and Contacts

- What type of vendors do you currently interact with?
- Vendor setup process
- Do you use 1099 vendors?
- What type of payment terms do you have set up with your vendors? i.e. Net30, Net45, etc. Are terms unique to each Vendor, or standard?
- Do you maintain credit limits for your vendors?
- Do you issue warnings or hard holds when a vendor credit limit is reached?
- Do you categorize your vendors? Provide some examples.
- Do you have contacts associated with your vendors? (i.e. Vendor = ABC Company, Contact = John Smith”
- Will NetSuite be the only system that houses your vendor data? Will NetSuite be the source of vendor master data?

## Purchasing

- Describe the current procurement process. How are goods and services purchased today?
- How many purchase orders are created per day, or per month?
- Do you use purchase requisitions?
- Do you use an approval process for your purchase requisitions?
- How many purchase requisitions are created per day?
- What rules do you have for purchase requisition or purchase order approval?  Is this dollar value or some other parameter based?
- Will the same approval rules apply to both purchase requisitions and purchase orders?
- Are purchase order values ever billed back to customers? (i.e. purchased via PO then invoice the customer for the purchase)
- Do you use drop ship purchase orders?
- Do you use special order purchase orders? (i.e. Just in time orders)
- Do you use requests for quotations?
- Do you use an approval process for this?
- Do you use blanket purchase orders?
- Do you use purchase contracts?

## Item Receipts

- How does the item receipt process work today? Who processes receipts? Where? How often?
- Are bulk item receipts processed against multiple purchase orders?
- Do you allow overages on Item receipts?
- Do you receive partial shipments against your purchase orders or only complete shipments?
- Will your receiving process be handled in NetSuite? Or will there be a third-party integration?
- If landed costs are to be tracked and assessed in NetSuite, describe all relevant landed cost categories and how these are currently allocated to inbound shipments and received inventory.

## Vendor Bills

- Do you use standalone/overhead vendor bills?
- How are discrepancies between the vendor bill quantity or value and the item receipt / purchase order quantity or value handled today?
- Do you have tolerance levels for discrepancies between purchase order, receipt, and vendor bill? i.e. you allow orders with discrepancies to go through as long as receipt and bill quantity is within a certain tolerance level.
- Is 3-Way Match required  to ensure amounts and quantities match between purchase orders, item receipts, and vendor bills?
- Do you have an approvals process for Vendor Bills that are created from purchased / received goods? Standalone vendor bills (i.e. Service vendors)?
- Do you perform vendor prepayments for specific vendors? In other words, are deposits of any sort paid to vendors prior to acceptance of a purchase order or receipt of goods?
- Do you ever bill in advance of receipt?

## Vendor Payments

- What are your payment methods for vendor bills?  Which of these will be performed out of NetSuite versus outside the system?
    - ○   Check?
    - ○   Wire/ACH?
    - ○   Credit Card?

## Advanced Electronic Payments

- What is the name of the bank in scope?
- If more than one bank, then fill out additional forms for each bank separately.
- What Country(ies) are you making payments from?
- 1.   If outside of US, does the bank file format require using a language other than English?
- 2.   What Currency(ies) are used for   payments?
- Do you need wire transfers?
    - a.       International wire transfers?
- Do you want to process payments in batches?
- Do you need an approval process before payments are submitted?
- Would you like to future date payments?
- Would you like to send vendor emails notifying them that a payment has been submitted?
- Do you need a Positive Pay file?
    - a.       Are you using EChecks?
- Question for your bank:
    - a.       Does the bank require 'Vendor Addenda' or 'Header/Footer Balancing'?
    - b.       Does bank utilize standard template file (ACH, EFT/DD)?
- If not, provide a sample file format?
    - c.       Can you confirm the Support Vendor CSV file size?
- For automation – verify the following with each bank in scope:
- Do you want automated transfer file (requires sFTP with SSH)?
    - a.       Does the bank support sFTP host-to-host connections?
    - b.       Does the bank require PGP Encription?
    - c.       Does the bank require IP Whitelisting?
    - d.       Does the bank require a password for SSH?

## Return to Debit

- What are the use cases for performing vendor return authorizations? Is there an approval process? How are returns shipped?
- Do you process vendor credit memos? For what purposes?
- Do vendors typically provide full refunds or issue credit memos?
- For defective items, do you return those items to vendors or scrap?
