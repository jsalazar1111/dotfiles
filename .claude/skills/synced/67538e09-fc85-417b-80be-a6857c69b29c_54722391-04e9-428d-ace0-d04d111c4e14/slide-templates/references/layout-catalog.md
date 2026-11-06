# Layout Catalog

Detailed documentation for each slide helper exported from `lib/slideHelpers.js`. Every helper adds a fully styled slide to the passed presentation and returns the slide object.

All parameters are keyword arguments passed in a single options object. Required parameters throw if missing or malformed.

---

## createPresentation()

Factory for a new Plative-branded presentation. Use this instead of `new pptxgen()` directly.

**Returns:** pptxgenjs Presentation instance with custom `PLATIVE_WIDE` layout (10 x 5.625 inches) applied and author/company metadata set to "Plative".

**Usage:**
```javascript
const pres = h.createPresentation();
// pres is now ready for addSlide() calls
```

---

## addTitleSlide(pres, opts)

Opening slide. Full-bleed mountain-sunset background, title and subtitle in center-left, date with gold accent line in top-left, logo in bottom-right on the dark mountain silhouette.

**Options:**
- `title` (string, required) — main title text
- `subtitle` (string, optional) — supporting line below title
- `date` (string, optional) — shown top-left with gold underline accent

**Source reference:** slide 1

**Content shape notes:**
- Title fits up to ~32 characters before wrapping. For longer titles, consider splitting into title + subtitle.
- Subtitle is typically one short phrase (e.g., "Leadership readout", "Q1 FY26").
- Date is a free-text string, not parsed.

**Example:**
```javascript
h.addTitleSlide(pres, {
  title: 'Marketing Cloud Transformation',
  subtitle: 'Discovery readout',
  date: 'April 2026',
});
```

---

## addAgendaSlide(pres, opts)

Two-panel layout. Mountain-panel image on left (36% width) with "Agenda" label. Numbered list of items on white right panel with thin dividers between rows.

**Options:**
- `items` (string[], required) — agenda items in order. Recommended max 8.
- `title` (string, optional) — left panel label, defaults to "Agenda"
- `pageNum` (number, optional) — page number shown bottom-right

**Source reference:** slide 2

**Content shape notes:**
- Each item should be a short phrase (3-6 words). Long items will wrap and may overflow the row.
- Items are auto-numbered starting at 1 in Soft Navy.
- Logo sits on the dark left panel, rendered in white (handled internally).

**Example:**
```javascript
h.addAgendaSlide(pres, {
  items: [
    'Engagement summary',
    'Key findings',
    'Recommendations',
    'Roadmap',
    'Investment',
    'Risks',
    'Next steps',
  ],
  pageNum: 2,
});
```

---

## addThreeBoxSlide(pres, opts)

Title + three equal-width content boxes. Each box has a navy header bar with centered white text and a light off-white body panel with left-aligned dark body text.

**Options:**
- `title` (string, required) — slide title
- `boxes` (Array, required, exactly 3) — each box is `{ header: string, body: string }`
- `pageNum` (number, optional)

**Source reference:** slide 3

**Content shape notes:**
- Throws an error if `boxes.length !== 3`.
- Headers are ~1-2 words. Body text fits ~20-30 words before it risks overflow.
- Use for: framework intros (Discovery/Design/Delivery), pillar explanations, option comparisons at a high level.

**Example:**
```javascript
h.addThreeBoxSlide(pres, {
  title: 'Engagement Approach',
  boxes: [
    { header: 'Discovery', body: 'Stakeholder interviews and current-state audit to ground recommendations in evidence.' },
    { header: 'Design', body: 'Target architecture and user experience patterns tailored to the business.' },
    { header: 'Delivery', body: 'Iterative build sprints with continuous review and hands-on enablement.' },
  ],
  pageNum: 3,
});
```

---

## addFindingsSlide(pres, opts)

Three-column findings layout with labels, underlines, content cards, and chevron connectors between columns. Specifically designed for discovery readouts.

**Options:**
- `title` (string, required) — slide title
- `whatWeHeard` (string[], required, exactly 2) — observations from discovery
- `recommendations` (string[], required, exactly 2) — recommendation statements
- `impacts` (Array, required, up to 3) — each impact is `{ direction: 'up'|'down'|'flat', text: string }`
- `pageNum` (number, optional)

**Source reference:** slide 4

**Content shape notes:**
- Column 1 and 2 cards fit ~15-20 words each.
- Impact text should be short outcome phrases (3-6 words): "Enhance customer experience", "Reduce operational complexity".
- Direction symbols: `up` shows teal ▲ (positive outcome), `down` shows crimson ▼ (reduction/decrease, often positive), `flat` shows navy ▶ (neutral).
- Chevrons (▶) between columns indicate flow: observation → recommendation → impact.

**Example:**
```javascript
h.addFindingsSlide(pres, {
  title: 'Marketing Cloud Discovery Findings',
  whatWeHeard: [
    'Client needs a scalable solution to optimize marketing communications.',
    'Unifying data from different sources is critical for effective campaigns.',
  ],
  recommendations: [
    'Implement Marketing Cloud Engagement to replace Acoustic.',
    'Build a unified customer profile using SF Data Cloud.',
  ],
  impacts: [
    { direction: 'up',   text: 'Enhance customer experience' },
    { direction: 'down', text: 'Reduce operational complexity' },
    { direction: 'up',   text: 'Track campaign ROI / attribution' },
  ],
  pageNum: 4,
});
```

---

## addSectionDividerDark(pres, opts)

Solid navy section divider. Large title centered-left, optional subtitle above in soft teal.

**Options:**
- `title` (string, required) — section title
- `subtitle` (string, optional) — typically a section number or category (e.g., "SECTION 02")
- `pageNum` (number, optional) — rendered in white on navy

**Source reference:** slide 5

**Content shape notes:**
- Use between major sections of a deck to signal transition.
- Pair with ALL-CAPS subtitle for the classic look: `subtitle: 'SECTION 03'`.

**Example:**
```javascript
h.addSectionDividerDark(pres, {
  title: 'Recommendations',
  subtitle: 'SECTION 02',
  pageNum: 5,
});
```

---

## addTableSlide(pres, opts)

Light-gradient background with brand-styled data table. Navy header row with white bold text, alternating white rows with dark body text.

**Options:**
- `title` (string, required) — slide title (navy)
- `subtitle` (string, optional) — teal subtitle below title
- `columns` (string[], required) — header row labels
- `rows` (string[][], required) — array of row arrays. Each inner array must have same length as `columns`.
- `pageNum` (number, optional)

**Source reference:** slide 6

**Content shape notes:**
- Table auto-sizes columns equally. For custom widths, build the table manually using pptxgenjs table options.
- 4-6 columns fit comfortably. More columns will cramp cell contents.
- 3-10 rows look good; beyond that, consider splitting across multiple slides.
- Cell values are auto-stringified, so numbers and booleans can be passed directly.

**Example:**
```javascript
h.addTableSlide(pres, {
  title: 'Phased Investment',
  subtitle: 'Three waves over twelve months',
  columns: ['Phase', 'Scope', 'Duration', 'Investment'],
  rows: [
    ['Phase 1', 'Foundation: Data Cloud + Marketing Cloud setup', '3 months', '$420K'],
    ['Phase 2', 'Journey build-out + Acoustic migration',         '4 months', '$510K'],
    ['Phase 3', 'Optimization + attribution modeling',            '5 months', '$380K'],
  ],
  pageNum: 6,
});
```

---

## addSectionDividerLandscape(pres, opts)

Full-bleed landscape background (mountains or lake). Large white title + soft teal subtitle in mid-left. Alternative to the solid-navy divider for more visual variety.

**Options:**
- `title` (string, required)
- `subtitle` (string, optional) — typically a section number
- `variant` ('mountains' | 'lake', optional, default 'mountains') — which landscape background
- `pageNum` (number, optional)

**Source reference:** slides 7 (mountains) and 8 (lake)

**Content shape notes:**
- Alternate variants across multiple section dividers for visual variety (mountains → dark → lake → dark → mountains).
- Title fits ~25 characters before wrapping to a second line.

**Example:**
```javascript
h.addSectionDividerLandscape(pres, {
  title: 'Implementation Roadmap',
  subtitle: 'SECTION 03',
  variant: 'mountains',
  pageNum: 7,
});
```

---

## addClosingSlide(pres, opts)

Full-bleed mountain-sunset background with large centered Plative logo. Optional closing text below.

**Options:**
- `closingText` (string, optional) — text below the logo (e.g., "Thank you", "Questions?")

**Source reference:** slide 11

**Content shape notes:**
- Always the last slide of a deck.
- No page number shown on closing slide.
- Keep closing text to 1-3 words.

**Example:**
```javascript
h.addClosingSlide(pres, { closingText: 'Thank you' });
```

---

## renderLogo(slide, opts)

Low-level helper for placing the Plative logo (crimson lantern + "PLATIVE" wordmark) anywhere on any slide. Used internally by all helpers, exposed for custom slide construction.

**Options:**
- `x`, `y` (number, required) — position in inches
- `h` (number, required) — total logo height in inches. Width is derived (~3.8 × h).
- `onDark` (boolean, optional, default false) — whether the area *under the logo* is dark. Controls wordmark color (white on dark, navy on light).

**Critical:** `onDark` describes what's under the logo, NOT the slide's overall theme. A two-panel slide may need `onDark: true` even if most of the canvas is white.

**Example:**
```javascript
// Small logo, bottom-left, light background
renderLogo(slide, { x: 0.28, y: 5.26, h: 0.28, onDark: false });

// Large centered logo on a dark hero image
renderLogo(slide, { x: 3.50, y: 2.55, h: 0.55, onDark: true });
```

---

## Icon usage

Icons are regular PNG files placed via pptxgenjs's standard `addImage`:

```javascript
const { ICON } = require('./lib/slideHelpers');
slide.addImage({
  path: ICON('light', 'icon_r2_c5.png'),
  x: 1.0, y: 2.5, w: 0.5, h: 0.5,
});
```

- Icons are named `icon_r{row}_c{col}.png` with rows 1-5 and columns 1-10 (50 icons per variant).
- Light variant has a teal/navy palette suited to white backgrounds.
- Dark variant has the same icons rendered for navy backgrounds.
- See `lib/iconManifest.js` for the full list.
