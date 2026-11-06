---
name: plative-upn-diagram
description: >-
  Generate a Plative-branded UPN (Universal Process Notation) process diagram in
  Lucidchart — the exact activity-card style Plative uses, with RACI (R/A/C/I)
  roles, systems-of-record banners, branded start/end terminators, branching, and
  callouts. Use this skill WHENEVER the user wants to create, build, draw, map, or
  document a business process, workflow, process flow, process map, RACI diagram,
  swimlane-style flow, or "how this works end to end" in Lucid — even if they don't
  say "UPN" by name. Trigger on requests like "map out our quote-to-cash process",
  "make a RACI diagram for onboarding", "diagram the approval workflow in Lucid",
  or "turn these steps into a Plative process diagram". Do NOT use it for generic
  org charts, mind maps, architecture diagrams, or non-process visuals.
---

# Plative Branded UPN Diagram

This skill produces **Plative's signature UPN process diagrams** and creates them
directly in Lucidchart. UPN (Universal Process Notation) maps a process as a row (or
grid) of **activity cards** — each a white rounded card showing a step number + a
Verb-Noun action, an R/A/C/I responsibility split, and a colored footer band naming
the system(s) of record — bracketed by a green "start" terminator and a red "end"
terminator, connected by labeled arrows.

The visual design (card geometry, the Plative red `#af1c11` / green `#008a0e` palette,
Open Sans type, exact pixel offsets) is baked into the bundled builder so every
diagram comes out on-brand and consistent. **Your job is to model the process well —
the builder handles the look.**

## How it works (end to end)

There are two moving parts:

1. **`scripts/build_upn.py`** — a pure-Python (standard library only, no pip installs)
   builder that turns a high-level process config into **Lucid Standard Import JSON**.
2. **The Lucid connector** — the tool `lucid_create_diagram_from_specification`
   ingests that JSON and creates the real diagram in the user's Lucid account,
   returning an edit URL.

Follow these steps:

### 1. Model the process into a config

Work with the user to capture the process as a list of steps. Each step needs, at
minimum, a Verb-Noun `name`, a `responsible` (R), and an `accountable` (A). Consulted
(C) and Informed (I) are optional. Add the `system` of record when known. For
branching / non-linear flows, use `connections` plus per-step `row`/`col` grid
placement.

Read **`references/upn-authoring.md`** for the complete field schema, the branching
rules, the color palette, and worked examples. Two ready-to-run example configs live
in `references/examples/` (`quote-to-cash.json` = linear, `approval-branch.json` =
grid with a rejection loop) — mirror their shape.

Write the config to a JSON file, e.g. `upn_config.json`.

### 2. Build the Standard Import JSON

```bash
python3 scripts/build_upn.py upn_config.json -o document.json
```

The script prints a one-line summary to stderr (shape/line counts, page size) and
writes `document.json`. It validates every shape type and raises a clear error if a
step is malformed, so fix any reported issue before continuing.

### 3. Create the diagram in Lucid via the connector

Call the Lucid connector's **`lucid_create_diagram_from_specification`** tool with:

- the **contents of `document.json`** as the specification / diagram JSON argument
  (the tool's parameter for the Standard Import spec),
- a **title** matching the process,
- **`use_assisted_layout` set to `false`** — this is critical, see below.

Then give the user the edit URL the tool returns.

> **CRITICAL: `use_assisted_layout` must be `false`.**
> Assisted layout re-arranges shapes to "neaten" them. A Plative activity card is not
> one shape — it's a precisely stacked group (container, footer band, divider, and four
> R/A/C/I text blocks at exact offsets). If assisted layout runs, it scatters those
> pieces and destroys the branding. The builder has already computed final absolute
> positions, so layout must stay off.

If the connector rejects the payload complaining about an unexpected `groups` field,
rebuild with `--strip-groups` and pass the result again:

```bash
python3 scripts/build_upn.py upn_config.json -o document.json --strip-groups
```

(`groups` only bundles a card's sub-shapes for easier manual selection in Lucid; the
diagram renders identically without it.)

## Fallback: no Lucid connector available

If the Lucid connector isn't connected in this workspace (no
`lucid_create_diagram_from_specification` tool), produce an importable file instead:

```bash
python3 scripts/build_upn.py upn_config.json --lucid diagram.lucid
```

Deliver `diagram.lucid` to the user and tell them to open it in Lucid via
**File → Import → Lucid (.lucid)**. Same branded output, one manual import step, no
authentication needed.

## Quality bar

A good UPN diagram, the Plative way:

- **Every step is a Verb + Noun in present tense** — "Create Quote", "Approve
  Discount", not "Quote creation" or "Quoting".
- **R and A are always filled in.** A step with no accountable owner is a modeling gap
  — ask the user rather than leaving it blank.
- **One consistent flow direction** (all horizontal or all vertical).
- **Systems named** where the work actually happens (Salesforce, NetSuite, etc.) so the
  footer band earns its place.
- **Branches are explicit** — decision outcomes become labeled arrows ("Approved" /
  "Rejected"), with the branch step dropped to `row: 1`.
- **Callouts carry the rules** that don't fit on a card (SLAs, approval thresholds,
  systems-of-record notes).

Model the process thoughtfully, keep the config faithful to how the work really runs,
and the branding takes care of itself.
