---
name: plative-solution-doc
description: Generate a Plative-branded technical solution DOCX after completing any project build, implementation, or client delivery. Use this skill proactively whenever a build is complete, a feature ships, an integration is finished, or a client deliverable is ready — even if the user doesn't explicitly ask for a document. The document captures the full technical story of what was built, following Plative's brand standards. Also triggers on phrases like "wrap up", "create the solution doc", "write up the deliverable", "generate the tech doc", or any post-build documentation request.
---

# Plative Technical Solution Document

After any project build or client delivery, create a branded DOCX using the Plative design system. This is a mandatory deliverable — treat it like part of the definition of done.

## Design System

The full Plative brand system lives at:
```
~/.claude/skills/plative-solution-doc/assets/design-system/
```

Key files to read when you need design specifics:
- `tokens.css` — single source of truth: all colors, type scale, spacing, radius, elevation
- `typography.html` — type scale with specimens and usage guidance
- `color-palette.html` — all brand colors with HEX/RGB/CMYK values
- `spacing.html` — spacing scale, radius tokens, elevation system
- `index.html` — overview of all 8 brand system sections
- `assets/logos/` — plative-logo-black.png, plative-logo-white.png
- `assets/graphics/` — aurora gradients, landscape photography for backgrounds

**Core tokens (memorize these):**

| Token | Value | Use |
|-------|-------|-----|
| Crimson | #E14136 | Primary accent, CTAs, section markers — never a flood color |
| Navy | #262A42 | Headings, cover background, dark surfaces |
| Soft Navy | #425582 | Supporting backgrounds, charts |
| Deep Teal | #005957 | Secondary data viz |
| Teal | #0D9DA4 | Supporting accent |
| Gold | #DEAB57 | Data viz, charts, highlights |
| Graphite | #4A4F66 | Body text |
| Slate | #7C8299 | Captions, metadata, labels |
| Paper | #F5F6F8 | Light surface backgrounds |

**Typography:**
- Font: Open Sans (installed at `assets/design-system/fonts/`)
- Titles: SemiBold 600 — heading hierarchy is 22pt → 16pt → 13pt in documents
- Subtitles: Light 300
- Body: Regular 400 at 11pt
- Eyebrows: SemiBold 11px, uppercase, 0.16em tracking, Crimson color

**Three non-negotiable brand principles:**
1. Crimson is an accent, never a flood — one CTA/highlight per surface
2. Open Sans only — no system fonts, no substitutes
3. Landscape/gradients set mood; type is always the hero

## Generator Script (HTML only)

`plative-doc` generates branded HTML — use it for visual QA and PDF output only. **Do not use it for DOCX or PPTX** — those formats are built by their own skills (docx-js and pptx respectively) which faithfully replicate the brand styling.

```bash
# HTML preview / QA
~/.claude/skills/plative-solution-doc/scripts/plative-doc \
  --client "CLIENT" --project "Title" --format html \
  --output /tmp/preview.html --input content.md

# PDF (Chrome headless — preserves full HTML styling)
~/.claude/skills/plative-solution-doc/scripts/plative-doc \
  --client "CLIENT" --project "Title" --format pdf \
  --output ~/Desktop/doc.pdf --input content.md
```

## Required Document Sections

Every technical solution document must contain these 8 sections in order. Write substantive content — this is a client-facing deliverable, not notes.

### 1. Executive Summary
2–4 paragraphs. What business problem was solved, what was built, what the client gains. No technical jargon — executive audience. Lead with business value.

### 2. Solution Architecture
High-level view of what components exist and how they connect. What systems are integrated, what the data flow looks like, which Salesforce clouds/features are involved. **Always include an inline SVG architecture diagram** — see the Inline SVG Diagrams section below for how to build it.

### 3. Technical Components
Enumerate every major component built: Flows, Apex classes, LWCs, integrations, custom objects, permission sets, etc. For each: name, type, and what it does. Use subsections (##) to group by component type.

### 4. Implementation Details
How the key technical decisions were made. Configuration choices, custom logic, patterns used. This is where the "how" lives — enough detail that another developer could maintain it.

### 5. Integration Points
Every external system touched: APIs called, data synced, authentication method, frequency, error handling. If none, state that explicitly.

### 6. Testing & Validation
What was tested, how, and what the pass criteria were. Unit tests, UAT scenarios, data validation. Include any known test results or coverage metrics.

### 7. Deployment & Configuration
Step-by-step deployment instructions. Environment variables, connected app setup, permission assignments, post-deployment steps. Should be complete enough for a fresh deployment.

### 8. Known Limitations / Future Considerations
Honest assessment of constraints, known edge cases, things deferred to a later phase. Helps the client set correct expectations and plan ahead.

## Inline SVG Diagrams

Diagrams paint pictures that paragraphs can't. Every document should have at least one — preferably two or three. The markdown content is passed through the `md_in_html` extension, so raw `<svg>` and `<div>` blocks render natively in the HTML output.

### When to add diagrams

| Section | Diagram type |
|---------|-------------|
| Solution Architecture | System topology — boxes for each system, labeled arrows for data flows |
| Technical Components | Component map — group by layer (UI / Logic / Data / External) |
| Integration Points | Sequence or flow — left-to-right event chain |
| Deployment | Step ladder — numbered deployment stages |

### How to write inline SVG

Write raw `<svg>` directly in the markdown. The generator passes it through untouched. Use Plative brand colors throughout:

```html
<div style="margin:24px 0;">
<svg viewBox="0 0 760 260" xmlns="http://www.w3.org/2000/svg"
     style="width:100%;max-width:760px;font-family:'Open Sans',sans-serif;">

  <!-- System box: Navy fill, white label -->
  <rect x="20" y="90" width="140" height="60" rx="6"
        fill="#262A42" stroke="none"/>
  <text x="90" y="125" text-anchor="middle" font-size="12"
        font-weight="600" fill="#FFFFFF">Salesforce</text>

  <!-- Arrow: Crimson stroke, label above -->
  <line x1="160" y1="120" x2="300" y2="120"
        stroke="#E14136" stroke-width="2" marker-end="url(#arr)"/>
  <text x="230" y="112" text-anchor="middle" font-size="10"
        fill="#E14136" font-weight="600">REST / JWT</text>

  <!-- Secondary system: Teal -->
  <rect x="300" y="90" width="140" height="60" rx="6"
        fill="#0D9DA4" stroke="none"/>
  <text x="370" y="125" text-anchor="middle" font-size="12"
        font-weight="600" fill="#FFFFFF">ERP</text>

  <!-- Arrow marker definition -->
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#E14136"/>
    </marker>
  </defs>
</svg>
</div>
```

### Color conventions for diagrams

| Color | Token | Use in diagrams |
|-------|-------|----------------|
| `#262A42` | Navy | Primary systems (Salesforce, core platform) |
| `#0D9DA4` | Teal | External/secondary systems (ERP, APIs) |
| `#425582` | Soft Navy | Supporting components, middleware |
| `#E14136` | Crimson | Arrows, data flows, integration lines |
| `#DEAB57` | Gold | Async flows, event-driven paths |
| `#F5F6F8` | Paper | Box backgrounds on light sections |
| `#4A4F66` | Graphite | Labels, sublabels |

### Tips
- Use `viewBox` so the diagram scales with the page width
- Keep boxes to 6–8 per diagram — clarity over completeness
- Add a short text caption below complex diagrams as a `<p>` tag
- For sequence flows, a horizontal left-to-right layout with labeled arrows reads fastest

---

## Workflow

### Step 1 — Gather context
If the build just happened in this conversation, you already have most of what you need. If not, ask: client name, project name, key technical details.

### Step 2 — Write the markdown
Create `/tmp/<client>-<project>-solution.md` with all 8 sections. Draw from the full conversation. Embed inline SVG diagrams for Solution Architecture and any section where a visual helps.

### Step 3 — Generate HTML, embed assets, inject page breaks, self-QA

**Always run these three steps together after generating HTML — never skip them.**

```bash
# 1. Generate HTML
~/.claude/skills/plative-solution-doc/scripts/plative-doc \
  --client "CLIENT" --project "Project Name" --format html \
  --output /tmp/<client>-solution-preview.html \
  --input /tmp/<client>-<project>-solution.md
```

```python
# 2. Embed all assets as base64 + inject page breaks (run immediately after)
import base64, re

with open('/tmp/<client>-solution-preview.html', 'r') as f:
    html = f.read()

# Embed logos (the generator uses file:// paths that browsers block)
SKILL_ASSETS = '/Users/roshankhan/.claude/skills/plative-solution-doc/assets/design-system/assets'
for logo in ['plative-logo-white.png', 'plative-logo-black.png']:
    path = f'{SKILL_ASSETS}/logos/{logo}'
    with open(path, 'rb') as f2: b64 = base64.b64encode(f2.read()).decode()
    html = html.replace(f'file:///{SKILL_ASSETS}/logos/{logo}', f'data:image/png;base64,{b64}')

# Embed cover background image
bg = f'{SKILL_ASSETS}/graphics/gradient-4-navy.jpg'
with open(bg, 'rb') as f2: b64 = base64.b64encode(f2.read()).decode()
html = html.replace(
    f"url('file:///{SKILL_ASSETS}/graphics/gradient-4-navy.jpg')",
    f"url('data:image/jpeg;base64,{b64}')"
)

# Inject print/PDF CSS
print_css = """
@page { size: Letter portrait; margin: 0; }
@media print {
  html, body { background: #fff; }
  .cover { min-height:100vh; height:100vh; page-break-after:always; break-after:page; }
  h2, h3 { break-after:avoid; page-break-after:avoid; }
  table, svg, img { break-inside:avoid; page-break-inside:avoid; }
  * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
}
.content { max-width:800px; margin:0 auto; padding:52px 64px 80px; }
.content div[style*="margin"] { text-align:center; break-inside:avoid; margin:32px auto !important; }
.content svg { display:block; margin:0 auto; max-width:100%; }
.content table { margin:16px 0 28px; }
"""
html = html.replace('</style>', print_css + '\n</style>', 1)

# Inject explicit page-break divs before each major section (h2)
# CSS @media print alone is unreliable — inject breaks directly in the DOM
PB = '<div style="page-break-before:always;break-before:page;height:0;margin:0;padding:0;"></div>\n'
sections_to_break = [
    # List the exact <h2> text for each section that should start a new page
    '<h2>Executive Summary</h2>',
    '<h2>Solution Architecture</h2>',
    # ... add remaining section headings
]
for marker in sections_to_break:
    html = html.replace(marker, PB + marker, 1)

with open('/tmp/<client>-solution-preview.html', 'w') as f:
    f.write(html)
```

**Why this matters:**
- The generator outputs `file://` paths for logos and the cover background — browsers block cross-origin `file://` loads, so logos won't render without base64 embedding
- `@media print` page-break CSS is unreliable across browsers; explicit `page-break-before:always` divs injected into the DOM are the only reliable way to control page splits
- Content sections in the generated HTML are `<h2>` tags (markdown `##`), not `<h1>` — CSS rules targeting `h1` won't fire on section headings

**Open in Arc for QA** (not the cmux browser — Arc renders print layout accurately):
```bash
open -a "Arc" /tmp/<client>-solution-preview.html
```

Self-review checklist — fix anything that fails:
- [ ] Logos visible in header and cover (base64 embedded)
- [ ] Cover background renders (not a blank navy block)
- [ ] All `<svg>` blocks render correctly, no overflow
- [ ] Page breaks land in the right places (use Cmd+P in Arc to preview)
- [ ] Brand colors correct (navy boxes, crimson arrows/accents, teal secondary)
- [ ] Tables: navy headers, alternating row shading
- [ ] No placeholder text, no "TODO", no first-person language

Iterate: edit markdown, re-run the generator, re-embed assets, re-inject breaks.

### Step 4 — Generate the final format

The output format determines which skill to use:

**DOCX** — use the `/docx` skill (docx-js). Build the document natively with full Plative styling. Key patterns:
- Cover page: full-page navy-shaded section, white Plative logo (ImageRun), large white project title, crimson 4px rule, client eyebrow text
- H1 sections: top border `{ style: BorderStyle.SINGLE, size: 12, color: "E14136" }`, navy color `262A42`, 22pt, SemiBold, "SECTION" eyebrow label above in crimson 9pt caps
- H2: navy `262A42`, 16pt, SemiBold
- H3: soft navy `425582`, 13pt, SemiBold
- Body: Graphite `4A4F66`, 11pt, Open Sans
- Tables: header rows shaded `262A42` (navy) with white text; alternating body rows `F5F6F8` (paper)
- Header per page: Plative logo left, `CLIENT · PROJECT` right in Slate caps
- Footer: `Confidential · Plative Inc.` left, `CLIENT · PROJECT · DATE` right
- SVG diagrams in the markdown won't transfer to DOCX — replace them with docx-js native tables/shapes that communicate the same architecture, or rasterize the SVGs to PNG first and embed as ImageRun

**PDF** — use Chrome headless via the generator script (HTML renders perfectly):
```bash
~/.claude/skills/plative-solution-doc/scripts/plative-doc \
  --client "CLIENT" --project "Project Name" --format pdf \
  --output ~/Desktop/<client>-solution-doc.pdf \
  --input /tmp/<client>-<project>-solution.md
```

**PPTX** — use the `/pptx` skill. Map each major section to a slide or slide group. Use navy title slides with crimson accents, and rebuild any diagrams as native PPTX shapes.

### Step 5 — Open for the user

For HTML/PDF review, always open in **Arc** (not cmux browser) — Arc renders print layout and page breaks accurately:
```bash
open -a "Arc" /tmp/<client>-solution-preview.html
```

For DOCX:
```bash
docxpreview ~/Desktop/<client>-solution-doc.docx
```

Confirm where the file was saved.

## Output Naming

Save to Desktop by default: `~/Desktop/<Client>-<Project>-Solution-Doc.docx`

Use title case, hyphens for spaces. Examples:
- `~/Desktop/REBNY-Agentforce-CPQ-Solution-Doc.docx`
- `~/Desktop/Captivate-SF-NS-Sync-Solution-Doc.docx`

## Content Quality Bar

The document represents Plative to the client. Hold it to this standard:
- No placeholder text, no "TODO" sections
- No first-person ("I built", "we implemented") — use passive or third-person ("The solution implements...", "The integration connects...")
- Concrete and specific — name the actual components, not "a flow was created"
- Each section should be at least 2–3 substantial paragraphs or a well-populated list
- Technical accuracy over completeness — if you don't know something, omit rather than guess

## Audience Calibration

**Always ask: who is reading this?** Before writing a single section, identify the audience and adjust depth accordingly.

| Audience | What to include | What to omit |
|---|---|---|
| Salesforce admin (George-type) | What the user sees, status lifecycle, what gets written back to SF, what they can configure | Internal API mechanics, attribute IDs, method-level implementation details |
| Developer / technical reviewer | Architecture decisions, API endpoints, data flows, error handling, test coverage | Business narrative fluff, obvious details |
| Executive | Business problem solved, what changed, what they gained | All technical detail |

**If documenting an integration:** distinguish clearly between what the user interacts with (the UI/LWC) and what happens in the background (service classes, API calls). Don't describe backend internals as if the user sees them. If a feature exists in code but isn't surfaced to the current audience's use case, mention it briefly as a future capability rather than documenting it in full.

**Read the actual code before writing.** Never describe what a component does based on its name or the original spec — read the implementation. Specs drift. Code doesn't lie.
