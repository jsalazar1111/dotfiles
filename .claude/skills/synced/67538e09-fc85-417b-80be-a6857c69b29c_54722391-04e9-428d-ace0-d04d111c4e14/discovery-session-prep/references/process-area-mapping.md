# Vertical / Product → Process Area Mapping

Use this to infer which process-area question banks are likely relevant for an
engagement, before the consultant confirms the final list. Always confirm — this
table drives a *suggestion*, not a final answer.

## Universal (include for every engagement)

| Process Area File | Why it's universal |
|---|---|
| `order-to-cash.md` | Every NetSuite deal has a sales/billing cycle |
| `procure-to-pay.md` | Every NetSuite deal has a purchasing/AP cycle |
| `record-to-report.md` | Every NetSuite deal has GL, close, and reporting |

## Product / vertical signals → additional process areas

| GTM Family / Product | Likely additional process areas | Signal to confirm |
|---|---|---|
| Manufacturing Standard / Premium | `plan-to-produce.md`, `items.md`, `warehouse-management.md` (if inventory ops are meaningful) | Work orders, BOMs, routings, discrete vs. process manufacturing |
| Food & Beverage | `plan-to-produce.md`, `items.md`, `warehouse-management.md` | Batch/lot production, shelf life, recipe/formula |
| Wholesale & Distribution (WD) Standard / Premium | `items.md`, `warehouse-management.md` | Multi-location inventory, 3PL, pick/pack/ship |
| Retail Standard / Premium | `items.md`, `order-to-cash.md` (POS/omnichannel emphasis) | POS, SuiteCommerce, omnichannel |
| Software Standard / Premium | `commissions.md` (if sales comp in scope), `call-to-resolution.md` (if support/case mgmt in scope) | Subscription billing, rev rec, SaaS metrics, support org |
| Consulting & IT Services / Professional Services Standard / Premium | `commissions.md`, `call-to-resolution.md` (if support desk) | Project billing, resource management, OpenAir |
| Financial Services (Financials First Standard / Premium) | `fixed-assets.md` (common), `record-to-report.md` emphasis on multi-book/multi-entity | Consolidations, complex rev rec, investment structures |
| Healthcare Standard / Premium | `items.md` (if inventory-heavy), `fixed-assets.md` | Multi-location, compliance, billing complexity |
| Social Impact / Nonprofit Standard / Premium | `grant-management.md`, `record-to-report.md` emphasis on fund accounting | Grants, restricted funds, donor tracking |
| Construction & Energy / FSM (standalone or Services Premium + FSM) | `fsm-business-details.md` (always start here), then the matching use-case file(s): `fsm-installation-and-commissioning.md`, `fsm-preventative-maintenance.md`, `fsm-break-fix-and-repair.md` | Which FSM use cases apply — ask, don't assume all three |

## Add-on / scope signals → process areas (regardless of vertical)

| If this is confirmed in scope... | ...include this process area |
|---|---|
| Fixed Asset Management module | `fixed-assets.md` |
| Incentive Compensation / commission tracking | `commissions.md` |
| Case Management / Support Center / Call to Resolution | `call-to-resolution.md` |
| Grant Management (any vertical, not just Nonprofit) | `grant-management.md` |
| Any Bill of Materials, Work Orders, or Routings | `plan-to-produce.md` |
| Multi-warehouse, WMS, mobile RF, bin/pick/pack | `warehouse-management.md` |
| Serialized/lot items, kits, matrix items, item costing | `items.md` |
| Field service, installation, maintenance contracts, break-fix | `fsm-*.md` (pick matching use case) |

## What NOT to include by default

- Don't include `plan-to-produce.md` or `warehouse-management.md` for a pure
  services/software deal with no physical inventory.
- Don't include all four FSM files just because FSM is in scope — confirm which
  use cases (installation, preventative maintenance, break-fix) actually apply.
  Most engagements only need one or two.
- Don't include `grant-management.md` outside Nonprofit/Social Impact unless a
  government or grant-funded revenue stream is explicitly mentioned.
