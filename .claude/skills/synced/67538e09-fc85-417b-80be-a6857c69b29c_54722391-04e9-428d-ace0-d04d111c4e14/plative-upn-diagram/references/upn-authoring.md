# UPN Authoring Reference

Complete schema for the config JSON consumed by `scripts/build_upn.py`. The builder
maps this config to Lucid Standard Import JSON using the exact Plative card geometry
and palette.

## Contents

- [UPN rules](#upn-rules)
- [Top-level config](#top-level-config)
- [Step object](#step-object)
- [Connection object](#connection-object) (branching / non-linear flows)
- [Callout object](#callout-object) (annotations)
- [Start / end node placement](#start--end-node-placement) (grid mode)
- [Color palette](#color-palette)
- [Worked examples](#worked-examples)

---

## UPN rules

These are the conventions that make a diagram read as proper UPN. Follow them when
turning a described process into steps:

1. **Activity cards are the only shape.** Each card is one process step. There are no
   separate decision diamonds or database cylinders — a decision is expressed as an
   activity ("Review Expense") with labeled outgoing arrows.
2. **Name every step Verb + Noun, present tense** — "Create Proposal", "Review
   Contract", "Issue Invoice". This keeps the process action-oriented and scannable.
3. **Every step needs at least R (Responsible) and A (Accountable).** C (Consulted) and
   I (Informed) are optional and render blank if omitted. If the user can't name an
   accountable owner, that's a real gap worth surfacing, not something to guess.
4. **One consistent flow direction** — all horizontal or all vertical. Don't mix.
5. **For branching/non-linear flows**, use explicit `connections` AND set `row`/`col`
   on each step for a multi-line grid. Providing any `connections` disables the
   automatic sequential wiring, so you control every arrow.
6. **For multi-line diagrams with branches** (a decision that forks to a different
   path), put the happy path on `row: 0` and branch steps on `row: 1`+ (below).

---

## Top-level config

```json
{
  "title": "Quote-to-Cash Process",
  "process_area": "Sales",
  "direction": "horizontal",
  "steps": [ ... ],
  "connections": [ ... ],
  "callouts": [ ... ],
  "startNode": { "row": 0, "col": -1 },
  "endNode":   { "row": 0, "col": 8 }
}
```

| Key            | Required | Description |
|----------------|----------|-------------|
| `title`        | yes      | Diagram title (also the Lucid page title). |
| `process_area` | yes      | Color theme for footer bands, dividers, and RACI labels. A named area or a `#hex`. See [palette](#color-palette). |
| `direction`    | no       | `"horizontal"` (default) or `"vertical"`. |
| `steps`        | yes      | Array of [step objects](#step-object). At least one. |
| `connections`  | no       | Array of [connection objects](#connection-object). When present, auto-connect is disabled. |
| `callouts`     | no       | Array of [callout objects](#callout-object) or plain strings. |
| `startNode`    | no       | Grid placement of the start terminator (grid mode only). |
| `endNode`      | no       | Grid placement of the end terminator (grid mode only). |

Start and end terminators are added automatically; you don't define them as steps.

---

## Step object

```json
{
  "id": "step2",
  "stepNumber": "2",
  "name": "Approve Discount",
  "responsible": "Deal Desk",
  "accountable": "VP Sales",
  "consulted": "Finance",
  "informed": "Sales Rep",
  "system": "Salesforce CPQ",
  "hasDrilldown": false,
  "row": 0,
  "col": 1
}
```

| Field          | Required | Description |
|----------------|----------|-------------|
| `id`           | yes      | Unique step id (`"step1"`, `"submit"`, …). Referenced by connections. |
| `stepNumber`   | yes      | Display number: `"1"`, `"2"`, `"2.1"` for a branch. |
| `name`         | yes      | Verb + Noun activity name. |
| `responsible`  | yes      | Role/person who does the work (R). |
| `accountable`  | yes      | Role/person who owns the outcome (A). |
| `consulted`    | no       | Consulted before action (C). Blank if omitted. |
| `informed`     | no       | Informed after action (I). Blank if omitted. |
| `system`       | no       | System/tool for this step (shown in the footer band). Defaults to "System(s)". |
| `hasDrilldown` | no       | `true` adds a corner triangle marking a sub-process. |
| `row`          | no       | Grid row. `0` = main flow, `1`+ = branch rows below. Presence of any `row`/`col` switches the whole diagram into grid mode. |
| `col`          | no       | Grid column (0-based, left to right). |

**Linear vs grid mode:** if no step has `row`/`col`, steps are auto-placed in sequence
and auto-connected. As soon as any step has `row` or `col`, the builder switches to
grid mode — you then position every step and (usually) define connections explicitly.

---

## Connection object

Use for branches, loops, and any non-sequential arrow. Providing `connections`
disables automatic step-to-step wiring (start→first and last→end arrows are still
added automatically).

```json
{
  "from": "review",
  "to": "revise",
  "label": "Rejected",
  "lineType": "elbow",
  "fromPosition": { "x": 0.5, "y": 1 },
  "toPosition":   { "x": 0.5, "y": 0 }
}
```

| Field          | Required | Description |
|----------------|----------|-------------|
| `from`         | yes      | Source step `id`. |
| `to`           | yes      | Target step `id`. |
| `label`        | no       | Arrow label (e.g. "Approved", "Rejected"). Auto-wraps. |
| `lineType`     | no       | `"elbow"` (default), `"straight"`, or `"curved"`. |
| `fromPosition` | no       | Source anchor `{x, y}` each 0–1. Default right-center `{1, 0.5}`. |
| `toPosition`   | no       | Target anchor `{x, y}`. Default left-center `{0, 0.5}`. |

Anchor guide: `{x:1,y:0.5}` = right edge, `{x:0,y:0.5}` = left edge, `{x:0.5,y:1}` =
bottom center, `{x:0.5,y:0}` = top center. For a branch dropping to `row: 1`, exit the
decision step from its **bottom** (`{0.5, 1}`) into the branch step's **top**
(`{0.5, 0}`); route the return arrow back the other way.

---

## Callout object

Notes attached to a step for rules that don't fit on the card — SLAs, thresholds,
system-of-record clarifications. Each entry may be a plain string (attaches to the last
step) or an object:

```json
{ "stepId": "step2", "text": "Discounts over 20% need VP sign-off (SLA 48h).", "color": "#FFE0E0", "width": 300, "height": 80 }
```

| Field                | Required | Description |
|----------------------|----------|-------------|
| `stepId` / `attachTo`| no       | Step to attach to. Defaults to the last step. |
| `text`               | yes      | Note text. |
| `color`              | no       | Fill `#hex` (default soft yellow `#FFF9E6`). |
| `width` / `height`   | no       | Explicit size; otherwise auto-sized to the text. |

Multiple callouts on the same step stack automatically.

---

## Start / end node placement

Only used in **grid mode**, to place the terminators sensibly around your grid.

```json
"startNode": { "row": 0, "col": -1 },
"endNode":   { "row": 0, "col": 3 }
```

Put the start one column to the left of the first step (`col: -1`) on the main row, and
the end one column past the last step. In linear mode the terminators are positioned
automatically and these keys are ignored.

---

## Color palette

`process_area` accepts a named area or any `#hex`. Named areas:

| Name         | Hex        |
|--------------|------------|
| `Sales`      | `#4A90D9`  |
| `Delivery`   | `#7B61FF`  |
| `Finance`    | `#50C878`  |
| `Operations` | `#FF8C42`  |
| `Support`    | `#E74C3C`  |
| `Default`    | `#6C757D`  |
| `blue`       | `#4A90D9`  |
| `purple`     | `#7B61FF`  |
| `green`      | `#50C878`  |
| `orange`     | `#FF8C42`  |
| `red`        | `#E74C3C`  |
| `gray`       | `#6C757D`  |
| `teal`       | `#20B2AA`  |
| `pink`       | `#FF69B4`  |

The `process_area` color drives each card's footer band, divider line, and the colored
R/A/C/I labels. The start terminator (green `#008a0e`) and end terminator (red
`#af1c11`) are fixed Plative brand colors regardless of `process_area`. A step may
override the theme with its own `"color"` field if one area of the process should stand
out.

---

## Worked examples

Both files are in `references/examples/` and run as-is:

- **`quote-to-cash.json`** — a linear 4-step Sales process with a callout. Good starting
  template for a straightforward sequential flow.
- **`approval-branch.json`** — a Finance process in grid mode: an "Approved" path
  continues right, a "Rejected" path drops to `row: 1` ("Revise Expense") and loops
  back with a "Resubmit" arrow. Good template for decision points and loops.

Build either with:

```bash
python3 scripts/build_upn.py references/examples/quote-to-cash.json -o document.json
```
