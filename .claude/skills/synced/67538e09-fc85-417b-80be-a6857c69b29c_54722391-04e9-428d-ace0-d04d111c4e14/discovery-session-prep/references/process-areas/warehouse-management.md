# Warehouse Management — Discovery Questions

*Source: Discovery Questions Combined (NetSuite implementation discovery bank)*


## WMS Overview

- Does your company have multiple warehouses? If yes, and any of your answers vary by warehouse, please provide details by warehouse in the response column.
- Does your company use a WMS?  Which WMS?
- Are warehouses currently equipped with WiFi?
- Do you manage inventory owned by others in any of your facilities (e.g. act as a 3PL)? If yes, what are the billing requirements?
- What is the approximate size of each warehouse (sq. feet)?
- How many people in ALL facilities will be using mobile RF handheld devices (for WMS)?

## Warehouse Layout

- Are you currently using Bin Locations?
- Are bins labelled with a scan-able barcode?
- How are bins organised in the facility (e.g. primary pick area; overflow area; velocity-based; item attributes (frozen, security cage, etc.), unit of measure, other)?
- Are items replenished from overflow / backstock to primary / preferred bins?

## Items

- How many items are tracked in the warehouse?
- Are items transacted in different Units of Measure (e.g. eaches, inners, cases, pallets)?
- Do different UoM's of the same item have different barcodes?
- Are items lot tracked (do you/will you use NS Item Type Inventory > Lot Numbered)?
- Are items serial number tracked (do you/will you use NS Item Type Inventory > Serialized)?
- Is the use of serial #'s high volume (e.g. 100's of S/N's per receipt/fulfilment)?
- Do you convert raw materials to finished goods (do you/will you use NS Item Type Assembly)?
- Do you perform cycle counts in the warehouse?  How often and what is the profile of counts (e.g. by velocity, aisle, etc.)?
- Are there scenarios where you bundle items, as part of the picking process, to be sold together (e.g. NetSuite Kit/Package Items)?  For instance, “computer kit" consists of a laptop, mouse, keyboard.  To fulfil the “computer kit” it is added to the sales order and the 3 components are picked as part of the picking process.
- Are warehouse-wide Inventory Counts performed today (annually, quarterly, monthly)?
- Are Cycle Counts performed for specific sections of the warehouse, or certain groups of products more frequently that full Inventory Counts?

## Inbound Operations

- What are the average and peak number of orders processed per day?  Average and peak lines per order?
- How is product delivered to the facility (e.g. LTL, TL, Container, Parcel, Other)?
- If you receive containers of full truckload shipments, might a single shipment contain multiple purchase orders (PO's)?
- Are items labelled when they arrive or do you need to print labels as part of the receiving process? (Note: Please supply sample inbound labels and identify data elements contained on the labels.)
- Are landed costs required?
- Is there a formal quality inspection process? Please elaborate if relevant.
- Are there circumstances where inventory is NOT putaway to storage so that it can be immediately picked for fulfilling sales, transfer, work/production orders?
- Do you receive returns?  How does the returns receiving process vary from the normal PO / Shipment receiving?
- How are items putaway today
    - ●    One by One > move one item at a time from staging to storage
    - ●    Cart Putaway > place items on a cart in staging and putaway to storage in one pass of the warehouse
    - ●    Mixed Item > multiple items placed on same pallet or box and putaway into a single storage bin; other)

## Outbound Operations

- What are the average and peak # of orders processed per day?  Average and peak lines per order?
- How are orders released for work in the warehouse (e.g. expected ship date, order type, etc.)?
- Do you pick orders one at a time (single-order pick)?
- Do you pick multiple orders with each "pass" of the warehouse (multi-order pick)?
- If you do multi-order picking, when picking the same item across multiple orders do you pick the full qty for all orders (bulk-pick) or do you pick qty for each order?
- Do you do zone picking e.g. picks for single or multiple orders are distributed across warehouse areas/zones and picked by operators assigned to that area/zone)?
- Do you do tally scanning (e.g. when picking an item picker scans each unit of the item versus scanning the item once and entering the pick quantity)?
- Do you pick a carton, pallet, or tote, where the picker enters/scans the picking ID for each pick performed?
- If the answer to #38 is yes, do you pick multiple orders to the same picking ID?
- Do you perform a discrete verification / packing step after picking?
- Are users required to "scan pack" (e.g. scan each item as part of the packing step)?
- How does the packer determine what goes in each carton and how does he determine the proper carton size/type?
- Do you utilize one packing slip format for all customers / orders?
- Which types of shipping do you utilize (e.g. UPS, Fedex, USPS, DHL, LTL, TL, Will-Call, Own Fleet, etc.)?
- Do you rate shops across carriers?
- Are there international shipping requirements?
- Are you required to provide your customers structured (electronic data interchange (EDI) formatted) ASN's
- Which types of shipping labels / documents are required (e.g. parcel shipping labels, BOL, commercial invoice, UCC-128, etc.)?

## Anything missing?

- Are there any unique requirements or expectations that you have which have not been discussed or questioned above?
