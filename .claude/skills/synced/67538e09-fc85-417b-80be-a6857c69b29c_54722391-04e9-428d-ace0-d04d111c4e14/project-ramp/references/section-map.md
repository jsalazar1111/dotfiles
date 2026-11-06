# KT Document Section Map

The Plative KT document produced by the `sales-to-delivery-kt` skill has 10 numbered sections. This file defines each section, the heading patterns to match, and hints for the React renderer.

---

## Section definitions

### 1. Header
**Heading patterns:** `## 1. Header`, `**1. Header**`, `1. Header`, `# Header`
**Content type:** Key-value block or compact table.
**Fields to extract:** Client Name, Account Tier, Client Partner, Solution Architect, Delivery Manager, Intended Start Date, Opportunity Number, Platform.
**Renderer:** Render as a 2-column definition list (`<dl>`). Each field on its own row. Use `NEEDS INPUT` highlight style where present.

### 2. Executive Summary
**Heading patterns:** `## 2. Executive Summary`, `**2. Executive Summary**`, `2. Executive Summary`
**Content type:** 3-5 sentences of prose.
**Renderer:** Plain paragraph(s). No special treatment.

### 3. Client Profile & Deal Context
**Heading patterns:** `## 3. Client Profile`, `**3. Client Profile`
**Content type:** Sub-sections: "What they do", "Why we won / deal context", "Key Terms glossary".
**Renderer:** Render each sub-section with a small `###`-style subheading. Key Terms glossary renders as a `<dl>` (term: definition) if structured, or prose if unstructured.

### 4. Scope, Goals & Explicit Exclusions
**Heading patterns:** `## 4. Scope`, `**4. Scope`
**Content type:** Sub-sections: "In scope" (may be a list or table of modules), "Goals / business outcomes" (prose), "Explicit exclusions" (list).
**Renderer:** Preserve bullet lists as `<ul>`. Tables as `<table>`. The exclusions list is visually distinct — give it a light crimson left border (`border-left: 3px solid #E14136`).

### 5. Current State / Technical Landscape
**Heading patterns:** `## 5. Current State`, `**5. Current State`
**Content type:** Mixed prose and/or table. No diagrams.
**Renderer:** Text and tables. If a table has a "System" + "Notes" column pattern, render with the system name column bolded.

### 6. Fit-Gap Analysis
**Heading patterns:** `## 6. Fit-Gap`, `**6. Fit-Gap`
**Content type:** Two-column table: "Current pain / requirement" → "How the solution addresses it (and any gap)".
**Renderer:** Table. If content is prose instead of a table, render as-is. Gap notes (partial solution or mismatch) render with a yellow background cell.

### 7. Stakeholders & Decision-Making
**Heading patterns:** `## 7. Stakeholders`, `**7. Stakeholders`
**Content type:** Table: Name, Title, LinkedIn, Role in deal, Notes for delivery.
**Renderer:** Full-width `<table>` with alternating row shading (`#F5F6F8` / white). "Role in deal" column: decision maker = navy badge, champion = teal badge, influencer = grey badge, blocker = crimson badge. LinkedIn cells: if a URL is present, render as a small linked icon, not the full URL.

### 8. Risks & Sensitive Topics
**Heading patterns:** `## 8. Risks`, `**8. Risks`
**Content type:** Table: Area, Risk / assumption, Confidence.
**Renderer:** Table. Confidence column: High = green, Medium = amber, Low = red badge.

### 9. Licensing & Delivery-Relevant Commercial Terms
**Heading patterns:** `## 9. Licensing`, `**9. Licensing`
**Content type:** Mixed prose and list. May include a table of modules/SKUs.
**Renderer:** Prose and/or table. Flag `NEEDS INPUT` with highlight style.

### 10. Links & Source Index
**Heading patterns:** `## 10. Links`, `**10. Links`
**Content type:** List of URLs and document references.
**Renderer:** Each item renders as a clickable `<a target="_blank">` link. Show the label (e.g. "Signed SOW", "Presales Folder") as anchor text. Add an external link icon (`↗`) after each link.

---

## `[Updated]` badge

When supplemental documents add or change content in a section, the enriched field or sentence is wrapped with `{{UPDATED}}` token before being passed to the React renderer. The renderer converts this to an inline teal badge:

```jsx
<span style={{
  background: '#0D9DA4',
  color: '#FFFFFF',
  borderRadius: 3,
  padding: '1px 5px',
  fontSize: '0.75em',
  fontWeight: 600,
  marginLeft: 4
}}>Updated</span>
```

Tab labels for sections containing at least one `{{UPDATED}}` token show a small teal dot (•) after the label: `§7 Stakeholders •`.

---

## Mid-engagement additions to section rendering

When in mid-engagement mode, two sections get additional rendering:

**§7 Stakeholders — contact delta:** If supplemental docs introduce new stakeholders not in the KT, render them in a teal-bordered "Added since KT" sub-table below the main stakeholder table.

**§8 Risks — risk status:** If supplemental docs report a risk as materialized, add a "Status" column to the risk table. Values: Open (grey), Materialized (crimson), Mitigated (green).

---

## Parsing edge cases

**No section numbers:** Some manually edited KT docs drop the numbers. Match on the section name keywords: "Header", "Executive Summary", "Client Profile", "Scope", "Current State", "Fit-Gap", "Stakeholders", "Risks", "Licensing", "Links".

**Merged or reordered sections:** If two sections appear merged (e.g. "Scope & Goals" containing exclusions), assign all content to the primary section (§4) and leave §5 as null.

**Extra content at top:** Some KT docs open with a Plative logo block or "INTERNAL — NOT FOR CLIENT DISTRIBUTION" header before §1. Discard this preamble; it's not section content.

**Tables in docx:** When extracting from `.docx` via the `file-reading` skill, tables come through as pipe-separated markdown (`| col | col |`). Parse these into arrays of row objects keyed by the header row.

**Rich text markers:** Bold (`**text**`), italic (`_text_`), and `NEEDS INPUT` pass through into the rendered content. The React component renders these via a lightweight markdown-to-JSX converter (see `artifact-spec.md`).
