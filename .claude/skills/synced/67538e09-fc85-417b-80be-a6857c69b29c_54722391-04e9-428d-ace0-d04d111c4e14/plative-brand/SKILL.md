---
name: plative-brand
description: "Plative brand guidelines for all designed outputs. Apply these guidelines whenever creating presentations (.pptx), documents (.docx), PDFs, HTML artifacts, React artifacts, slides, decks, reports, one-pagers, proposals, or any other deliverable with visual design for Plative. Trigger this skill whenever the output involves colors, fonts, layouts, or visual styling, even if the user does not explicitly mention 'brand' or 'Plative'. If the user asks to create any professional document, presentation, or visual asset, use this skill to ensure brand consistency. Also trigger when the user mentions 'on-brand', 'brand guidelines', 'our colors', 'our fonts', or 'Plative style'."
---

# Plative Brand Guidelines

This skill ensures all designed outputs match Plative's visual identity system. **Read `references/brand-specs.md` before producing any designed output** to get the full color codes, typography rules, layout patterns, and do's/don'ts.

## Quick Reference

### Colors (use exact hex values)

**Primary:**
- Crimson: `#E14136` (primary accent, logo, CTAs)
- Navy Blue: `#262A42` (dark backgrounds, headers)
- Soft Navy: `#425582` (secondary dark elements)
- Gold: `#DEAB57` (accent highlights)

**Secondary:**
- Deep Teal: `#005957`
- Teal: `#0D9DA4`
- Soft Teal: `#9CDAE6`

**Neutrals:** White `#FFFFFF` for light backgrounds, Navy `#262A42` for dark backgrounds.

### Typography

- **Titles:** Open Sans Semi Bold
- **Subtitles:** Open Sans Light
- **Body:** Open Sans Regular
- **Never use:** Fjalla One, Arial (unless Open Sans is unavailable), or random fonts
- Open Sans is always the correct choice. If it's not available in the output format, use a close substitute and note it.

### Logo Placement

- Bottom-right corner of slides, with the Plative lantern icon in Crimson and wordmark in the appropriate contrast color
- On white/light backgrounds: Crimson lantern + black wordmark
- On dark backgrounds: Crimson lantern + white wordmark
- Never use an all-white, all-black, or all-crimson logo

### Core Design Principles

1. **Two-panel layout** is a signature Plative pattern: dark navy/gradient left panel (~40% width) with white right panel for content
2. **Section dividers** use full-bleed landscape/gradient backgrounds from the approved graphic assets (mountains, prairie, forest, city, gradients)
3. **Crimson** is the primary accent, used sparingly for emphasis, CTAs, and the logo. Do not overuse it.
4. **Navy Blue** dominates dark sections. Gold accents complement it.
5. **Teal family** is used for secondary visual elements, CTAs on light backgrounds, and supporting graphics
6. **High contrast is mandatory:** light text on dark backgrounds, dark text on light backgrounds. Never dark-on-dark or light-on-light.

## How to Apply

When creating any designed output:

1. Read `references/brand-specs.md` for the complete specification
2. Use the exact hex colors listed above (do not approximate)
3. Apply Open Sans font family throughout (Semi Bold for titles, Light for subtitles, Regular for body)
4. Follow the contrast rules for text/background combinations
5. Place the Plative logo in the bottom-right of slides/pages
6. Use the two-panel layout pattern where appropriate
7. For CTA buttons: use Crimson, Gold, Teal, Deep Teal, or Navy fills with white text on light backgrounds. On dark backgrounds, use Soft Teal, Gold, or Crimson fills.

## Output-Specific Notes

### Presentations (.pptx)
- Title/section slides: use dark navy or gradient backgrounds with white text
- Content slides: use white background with navy/dark text, or the two-panel layout
- Always include the Plative logo (Crimson lantern + appropriate wordmark) in bottom-right
- Page numbers near the logo, separated by a thin vertical line

### Documents (.docx)
- Headers in Navy Blue (#262A42) using Open Sans Semi Bold
- Body text in dark gray or Navy using Open Sans Regular
- Accent color for highlights and callouts: Crimson (#E14136)
- Section dividers or horizontal rules in Crimson or Teal

### HTML / React Artifacts
- Apply the same color palette via CSS variables or Tailwind classes
- Use Google Fonts to load Open Sans
- Maintain the same contrast and color usage rules

### PDFs
- Same color and typography rules as documents
- Use the two-panel layout for cover pages where appropriate
