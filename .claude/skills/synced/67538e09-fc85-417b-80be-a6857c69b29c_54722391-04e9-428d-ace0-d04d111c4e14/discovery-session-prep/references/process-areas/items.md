# Items — Discovery Questions

*Source: Discovery Questions Combined (NetSuite implementation discovery bank)*


## Item Master Overview

- How many items are sold by a business unit or subsidiary? Overall?
- What does the lifecycle of an item entail for an inventory item (in detail)? (Ex: Plan > Purchase > Consume / Sell or Plan > Build > Consume / Sell > Reuse)
- What is the process for item creation and/or maintenance? Who is involved, and what is the sequence of events?
- What system will be the System of Record (SOR) for Item Master Management?
- Is revision control utilized for Bill of Materials to track and control component and process changes over time?
- Is there a need to ‘fulfill’ any non-inventory items on transactions to indicate delivery? (Note: no COGS posting will occur)
- How are discounts and promotional items associated with transactions? Do these items post to a specified general ledger account, or is the net transaction balance posted?
- For transactions with item groups or kits, should components be displayed on transactions? Or should only the parent group or kit display?
- Are there Parent-Child relationships between item records in your item master?
- Do your customers have different name / numbering schemes for your item? Do your vendors?
- Can you substitute items on orders if one is not available? (i.e. if Item A is out of stock, sell Item B)

## Serialised / Lot Numbered Items

- Which items of yours are serialised or lot numbered?
- At what point in your process do you create the serial number for the item?
- At what point in your process do you create the lot number for the item?
- What lot numbering system do you use for your items?  Are expiry dates recorded on lots and are adhered to?

## Item Type

- Description

## Inventory

- An inventory item is a product that you purchase and resell, or manufacture into another item for resell.

## Non-Inventory (for sale, purchase, resale)

- A non-inventory item is a product that you sell or purchase but do not record into inventory.

## Service (for sale, purchase, resale)

- A service item is an item you create to track time and record billable hours.

## Other Charge (for sale, purchase, or resale)

- Other charge items are typically used to represent miscellaneous charges that do not fall into other categories.

## Item Groups

- Item groups are used to consolidate items on invoices for either display to customers, ease of entry or VSOE bundling. The member items are treated independently from a revenue perspective.

## Matrix

- By setting up an item matrix that consists of a parent item and subitems, matrix items enables you to track your items by available options. Then, each combination is tracked separately without having to create an item record for each combination.

## Kits

- This is a record to identify several member items that are sold together as one unit. The price of the kit is not dependent on its components' prices and can be assigned several price levels.

## Discount / Markup

- These items can be applied as a line item or to the total amount of the transaction.  The discount/markup can be calculated as either a percentage or a flat rate.

## Item Costing

- What costing method is used for your items? i.e. FIFO, LIFO, Standard Costing, Average

## Inventory Management

- How many locations currently stock inventory? How many locations do you manufacture out of?
- Will you be using Bins to track inventory within locations?
- How often are inventory counts performed? Anything unique we need to know of?
- How is inventory replenishment planned?
- Do you plan on utilizing demand plans and supply plans to calculate when to replenish inventory? Or do you plan on using reorder points?
- Do you track landed cost? i.e. Freight, shipping costs.
- How are they being allocated? By item weight? Quantity?
- Do you need to include landed cost in purchase price?
- Do you currently transfer inventory between locations? Do you associate a transfer cost?
- Do Transfer Orders impact supply/demand planning?
- Discuss your inventory transfer process.
- Do you create transfer orders and then fulfill the order?
- Are inventory adjustments used? Discuss the use cases and provide example scenarios
- Will you use different statuses to group inventory on hand? (i.e. “Good, Quarantine, On Hold”
- Discuss different units of measure and uses for each.
- Will item barcoding be used? Will item labels be used?

## Org Structure, Roles, Approvals

- Describe the team structure in Supply Chain & Inventory Management, including name, title, supervisor, tenure with the company, prior ERP/accounting system experience, and assigned project role (sponsor, project manager, process owner, power user, and/or end user).

## Sample Documents Request

- Please provide current-state samples of the following:
    - -     List of all reports required for mapping to NS
    - -     Sample(s) of formatting for critical and unique reporting requirements
    - -     Printed Forms
- These can be shared either via our project GSuite repository, your NS file cabinet, or via another secure document sharing service of your choice.

## Anything missing?

- Are there any unique requirements or expectations that you have which have not been discussed or questioned above?
