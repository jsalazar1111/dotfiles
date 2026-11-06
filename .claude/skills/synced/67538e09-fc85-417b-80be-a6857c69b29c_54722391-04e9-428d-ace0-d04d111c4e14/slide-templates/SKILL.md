---
name: slide-templates
description: "Plative-branded pptxgenjs slide layouts for generating presentations that match the official reference deck. Use this skill whenever the user asks to create a Plative presentation, slide deck, client deck, executive summary, proposal deck, discovery readout, findings slide, section divider, title slide, closing slide, or any slide that should follow Plative brand. Trigger this skill when the output is a .pptx file and the aesthetic should match the Plative reference slides (mountain/landscape hero backgrounds, navy + crimson brand colors, Open Sans typography, crimson-lantern logo). Also trigger when the user mentions 'Plative template', 'branded slides', 'our slide deck style', 'reference slides', or references a specific layout like 'agenda slide', 'three-column findings', 'section divider', or 'table slide'. Do not use for non-Plative presentations or when the user wants freeform slide design unrelated to the brand."
---

# Plative Slide Templates

Pre-built pptxgenjs helper functions that reproduce the 8 canonical layouts from the Plative reference deck. Every helper is brand-locked (Plative colors, Open Sans, crimson lantern logo). Callers supply content only.

## When to use this skill

Any time a Plative-branded .pptx is being generated. Do NOT use for custom decks that intentionally deviate from brand, or for one-off slides where the user wants a different aesthetic.

## Quick start

```javascript
const h = require('./lib/slideHelpers');
const pres = h.createPresentation();

h.addTitleSlide(pres, { title: 'Q1 Review', subtitle: 'Leadership', date: 'April 2026' });
h.addSectionDividerDark(pres, { title: 'Findings' });
h.addThreeBoxSlide(pres, { title: 'Pillars', boxes: [...] });
h.addClosingSlide(pres, { closingText: 'Thank you' });

await pres.writeFile({ fileName: 'out.pptx' });
```

## Available helpers

| Helper | Source slide | When to use |
|---|---|---|
| `addTitleSlide` | 1 | Opening slide of any deck |
| `addAgendaSlide` | 2 | Up to 8 numbered agenda items |
| `addThreeBoxSlide` | 3 | Three equal concepts with header + description |
| `addFindingsSlide` | 4 | Discovery readouts: observations → recommendations → impacts |
| `addSectionDividerDark` | 5 | Transition between major sections (solid navy) |
| `addTableSlide` | 6 | Tabular data with brand-styled cells |
| `addSectionDividerLandscape` | 7, 8 | Alternative section dividers (mountains or lake variant) |
| `addClosingSlide` | 11 | Final slide with centered logo and optional closing text |

**For full parameter contracts and content shape of each helper, read `references/layout-catalog.md`.**

## Brand constants

All color, font, size, and layout constants are exported from `lib/brandConstants.js` and re-exported through `lib/slideHelpers.js`. Use these instead of hardcoding values:

```javascript
const { COLORS, FONTS, SIZES } = require('./lib/slideHelpers');
// COLORS.crimson, COLORS.navy, COLORS.softTeal, etc.
// FONTS.title, FONTS.body, FONTS.subtitle
// SIZES.slideTitle, SIZES.body, etc.
```

## Custom slides

For one-off layouts not covered by a helper, use `createPresentation()` for the correct canvas size and brand defaults, then build the slide manually using the exported constants. Always call `renderLogo(slide, {x, y, h, onDark})` for consistent logo placement:

```javascript
const { createPresentation, renderLogo, COLORS, FONTS, LAYOUT } = require('./lib/slideHelpers');
const pres = createPresentation();
const slide = pres.addSlide();
slide.background = { color: COLORS.white };
// ... add your shapes and text ...
renderLogo(slide, { x: LAYOUT.logo.x, y: LAYOUT.logo.y, h: LAYOUT.logo.h, onDark: false });
```

## Icons

100 approved Plative icons are included in `assets/icons/` (50 light-bg variants, 50 dark-bg variants). Use the `ICON` helper to reference them:

```javascript
const { ICON } = require('./lib/slideHelpers');
slide.addImage({ path: ICON('light', 'icon_r1_c1.png'), x: 1, y: 1, w: 0.5, h: 0.5 });
```

See `lib/iconManifest.js` for the full list.

## Logo placement rule

The `renderLogo` helper takes an `onDark` flag. This flag describes what's **under the logo**, not the slide's overall theme. Two-panel slides where the logo sits on a dark panel (like agenda) need `onDark: true` even if most of the slide is white. The built-in helpers handle this correctly.

## Canvas size

Source deck is 10 x 5.625 inches (widescreen 16:9). The built-in pptxgenjs `LAYOUT_WIDE` is 13.333 x 7.5 which does NOT match. Always use `createPresentation()` which applies a custom `PLATIVE_WIDE` layout. Never set `pres.layout` manually.

## Brand compliance

All off-brand colors and fonts from the source deck have been swapped for canonical Plative values:

- Roboto, Calibri → Open Sans
- Off-brand blues (`#225393`, `#383E62`) → Plative Soft Navy `#425582` / Navy `#262A42`
- Off-brand red (`#AF1C11`) → Plative Crimson `#E14136`
- Light blue tints → Off-white `#F5F6FA`

For complete brand specs, read the companion `plative-brand` skill.

## Directory

```
slide-templates/
├── SKILL.md                     # this file
├── references/
│   └── layout-catalog.md        # detailed per-helper documentation
├── lib/
│   ├── brandConstants.js        # COLORS, FONTS, SIZES, LAYOUT
│   ├── slideHelpers.js          # 8 layout helpers + renderLogo + createPresentation
│   └── iconManifest.js          # icon inventory (50 light + 50 dark)
├── assets/
│   ├── plative-lantern.png      # crimson mark, transparent bg
│   ├── backgrounds/             # 7 JPG backgrounds (mountain, lake, gradient, etc.)
│   └── icons/
│       ├── light/               # 50 icons for light backgrounds
│       └── dark/                # 50 icons for dark backgrounds
└── example.js                   # reference deck exercising every helper
```

## Dependencies

```bash
npm install pptxgenjs
```

No other dependencies. All assets are local.
