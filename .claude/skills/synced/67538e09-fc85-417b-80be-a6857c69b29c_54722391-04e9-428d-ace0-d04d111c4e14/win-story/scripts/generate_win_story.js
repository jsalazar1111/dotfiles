/**
 * Win Story Slide Generator — Plative Customer Win Story Template
 * 
 * Replicates the official Plative Customer Win Story infographic template:
 * Portrait-ish single-slide layout with dark hero header, stat bar, solution diagram,
 * why netsuite/plative/AI panels, quote strip, and three bottom sections.
 *
 * Slide dimensions: 6.07" × 10.41" (approx — portrait ratio)
 * All coordinates in inches.
 *
 * Usage: node generate_win_story.js
 * Output: /mnt/user-data/outputs/[CompanyName]_WinStory.pptx
 */

const path    = require('path');
const pptxgen = require('pptxgenjs');

// ─── Brand colors ─────────────────────────────────────────────────────────────
const C = {
  navy:      '14182E',   // dark hero header bg
  navyMid:   '1C2540',   // mid-navy panels (why netsuite etc.)
  navyLight: '262A42',   // lighter navy (bottom panels)
  crimson:   'E14136',
  white:     'FFFFFF',
  offWhite:  'F5F6FA',
  lightGray: 'E8E9EC',
  midGray:   'B0B3BE',
  darkText:  '1C1C2E',
  cardBg:    'F9FAFB',
  borderGray:'DCDDDE',
  tagBg:     'EAECF5',
  tagText:   '44506B',
};

const ASSET_DIR   = '/mnt/skills/user/slide-templates/assets';
const LOGO_LIGHT  = path.join(ASSET_DIR, 'plative-logo-light.png');
const LOGO_DARK   = path.join(ASSET_DIR, 'plative-logo-dark.png');
const LOGO_ASPECT = 3.374;

// ─── Slide dimensions (portrait) ─────────────────────────────────────────────
const W = 6.07;
const H = 12.00;

// ─── DEAL DATA — replace with extracted values ────────────────────────────────
const deal = {
  // Header
  label:         'WIN STORY · HIGH TECH & DATA INFRASTRUCTURE',
  headline:      'Northwind Analytics consolidated nine systems onto one NetSuite core.',
  headlineEmphasis: ['nine systems'],          // words to highlight in crimson
  subhead:       'An 800+ person data-infrastructure leader running on Sage Intacct and a sprawl of point systems. Plative unified finance, billing, and reporting on NetSuite in a single-phase, 8-month go-live.',

  // Stat bar (5 tiles)
  stats: [
    { label: 'INDUSTRY',      value: 'High Tech',      sub: 'Data infrastructure' },
    { label: 'HEADQUARTERS',  value: 'San Mateo, CA',  sub: null },
    { label: 'FOUNDED',       value: '2007',           sub: null },
    { label: 'EMPLOYEES',     value: '800+',           sub: null },
    { label: 'EXISTING ERP',  value: 'Sage Intacct',   sub: '+ 8 point systems' },
  ],

  // Why panels (3)
  whyNetSuite: 'One unified data model — finance, CRM, inventory and analytics on a single ledger. 25+ years, ASC 606 native, SuiteTax across 110+ countries, scaling from one entity to global multi-entity.',
  whyPlative:  'A NetSuite + Salesforce SI with 2,000+ delivered projects and productized IP — billing, SaaS metrics, dunning — shipped on day one instead of scoped later.',
  aiNote:      'Text Enhance, predictive forecasting and anomaly detection in-platform, plus the Plative AI Connector for natural-language reporting, governed under ISO 42001 with a clean audit trail as AI scales.',

  // Customer quote
  quote:        'Consolidating onto NetSuite with Plative gave our finance org real operational cohesion — one source of truth, faster closes, and reporting we actually trust.',
  quoteAttrib:  'VP, Finance & Operations',
  quoteCompany: 'NORTHWIND ANALYTICS',

  // NetSuite Solution
  edition:      'SuiteSuccess Software PRM',
  modules:      ['Record to Report', 'Procure to Pay', 'Project to Cash', 'Order to Cash', 'NSAW'],
  integrations: ['Salesforce', 'Tipalti', 'Expensify', 'Avalara', 'Adaptive', 'Banking', 'Payroll'],

  // Implementation
  timeline:     '8 months',
  methodology:  'SuiteSuccess + Optimization',
  approach:     'Single-phase deployment with core finance live in month 8, integrating third-party systems in phase 1.',

  // Teams
  nsAE:       'Account Executive',
  platLead:   'Engagement Manager',
  platDeliv:  'Solution Architect · Senior PM',

  // Output
  companySlug: 'NorthwindAnalytics',
};

// ─── Helper: render a pill/tag ────────────────────────────────────────────────
function addPill(slide, text, x, y, w, opts = {}) {
  const bg    = opts.bg    || C.tagBg;
  const fg    = opts.fg    || C.tagText;
  const sz    = opts.sz    || 6.5;
  const h     = opts.h     || 0.175;
  const bold  = opts.bold  || false;
  slide.addShape('roundRect', { x, y, w, h, fill: { color: bg }, line: { color: bg }, rectRadius: 0.05 });
  slide.addText(text, { x, y, w, h, fontSize: sz, bold, color: fg, fontFace: 'Open Sans', align: 'center', valign: 'middle' });
}

// ─── Build presentation ───────────────────────────────────────────────────────
const pres = new pptxgen();
pres.defineLayout({ name: 'PLATIVE_WIN', width: W, height: H });
pres.layout  = 'PLATIVE_WIN';
pres.author  = 'Plative';
pres.company = 'Plative';

const slide = pres.addSlide();

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 1: DARK HERO HEADER
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_H = 2.36;

slide.addShape('rect', { x: 0, y: 0, w: W, h: HERO_H, fill: { color: C.navy }, line: { color: C.navy } });

// Plative logo — top left
const logoH = 0.165;
slide.addImage({ path: LOGO_LIGHT, x: 0.44, y: 0.27, w: logoH * LOGO_ASPECT, h: logoH });

// Top right label
slide.addText('CUSTOMER WIN STORY · NETSUITE ·', {
  x: 2.6, y: 0.245, w: 3.2, h: 0.18,
  fontSize: 5.5, color: C.white, fontFace: 'Open Sans',
  align: 'right', bold: false,
  transparency: 55,
});

// Vertical rule before section label
slide.addShape('line', { x: 0.44, y: 0.62, w: 0.32, h: 0, line: { color: C.crimson, pt: 1.5 } });

// Section label (e.g. WIN STORY · HIGH TECH & DATA INFRASTRUCTURE)
slide.addText(deal.label, {
  x: 0.44, y: 0.69, w: W - 0.88, h: 0.20,
  fontSize: 5.5, color: C.crimson, fontFace: 'Open Sans',
  bold: true, charSpacing: 1.2,
});

// Customer logo placeholder (top right of hero)
const logoBoxW = 1.08; const logoBoxH = 0.88;
slide.addShape('roundRect', { x: W - logoBoxW - 0.32, y: 0.55, w: logoBoxW, h: logoBoxH,
  fill: { color: C.white }, line: { color: C.borderGray, pt: 0.75 }, rectRadius: 0.06 });
slide.addText('CUSTOMER\nLOGO', { x: W - logoBoxW - 0.32, y: 0.55, w: logoBoxW, h: logoBoxH,
  fontSize: 6, color: C.midGray, fontFace: 'Open Sans', align: 'center', valign: 'middle', bold: true, charSpacing: 0.8 });

// Headline — large bold white, keywords in crimson
// Build rich text runs, replacing emphatic words
const words   = deal.headline.split(' ');
const emph    = deal.headlineEmphasis || [];
const runs    = [];
let   buf     = '';
words.forEach((word, i) => {
  const bare  = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const match = emph.some(e => word.toLowerCase().includes(e.toLowerCase().split(' ')[0]));
  if (match) {
    if (buf) runs.push({ text: buf.trimEnd() + ' ', options: { color: C.white } });
    buf = '';
    runs.push({ text: word + ' ', options: { color: C.crimson } });
  } else {
    buf += word + ' ';
  }
});
if (buf) runs.push({ text: buf.trim(), options: { color: C.white } });

slide.addText(runs, {
  x: 0.44, y: 0.94, w: W - 1.80, h: 0.88,
  fontSize: 15, bold: true, fontFace: 'Open Sans',
  wrap: true, lineSpacingMultiple: 1.15,
});

// Subhead
slide.addText(deal.subhead, {
  x: 0.44, y: 1.88, w: W - 0.88, h: 0.44,
  fontSize: 7, color: C.lightGray, fontFace: 'Open Sans',
  wrap: true, lineSpacingMultiple: 1.3,
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 2: STAT BAR (5 tiles)
// ═══════════════════════════════════════════════════════════════════════════════
const STAT_Y = HERO_H;
const STAT_H = 0.60;
const tileW  = W / deal.stats.length;

deal.stats.forEach((stat, i) => {
  const tx = i * tileW;
  const bg = i % 2 === 0 ? C.offWhite : C.white;
  slide.addShape('rect', { x: tx, y: STAT_Y, w: tileW, h: STAT_H,
    fill: { color: bg }, line: { color: C.borderGray, pt: 0.4 } });
  // Label
  slide.addText(stat.label, { x: tx + 0.09, y: STAT_Y + 0.06, w: tileW - 0.12, h: 0.14,
    fontSize: 5, bold: true, color: C.crimson, fontFace: 'Open Sans', charSpacing: 0.8 });
  // Value
  slide.addText(stat.value, { x: tx + 0.09, y: STAT_Y + 0.20, w: tileW - 0.12, h: 0.22,
    fontSize: 10.5, bold: true, color: C.darkText, fontFace: 'Open Sans' });
  // Sub-label
  if (stat.sub) {
    slide.addText(stat.sub, { x: tx + 0.09, y: STAT_Y + 0.42, w: tileW - 0.12, h: 0.14,
      fontSize: 5.5, color: C.midGray, fontFace: 'Open Sans' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 3: SOLUTION DESIGN AT A GLANCE (diagram placeholder)
// ═══════════════════════════════════════════════════════════════════════════════
const SOL_Y = STAT_Y + STAT_H + 0.08;
const SOL_H = 2.40;
const PAD   = 0.26;

slide.addShape('roundRect', { x: PAD, y: SOL_Y, w: W - PAD*2, h: SOL_H,
  fill: { color: C.white }, line: { color: C.borderGray, pt: 0.6 }, rectRadius: 0.07 });

// Section header
slide.addText([{text: 'Solution Design ', options: {bold: true, color: C.darkText}}, {text: 'At a Glance', options: {bold: true, color: C.crimson}}], { x: PAD + 0.18, y: SOL_Y + 0.14, w: 2.5, h: 0.22,
  fontSize: 8.5, fontFace: 'Open Sans' });
slide.addText('ARCHITECTURE DIAGRAM', { x: W - PAD - 1.30, y: SOL_Y + 0.17, w: 1.24, h: 0.18,
  fontSize: 5, color: C.midGray, fontFace: 'Open Sans', align: 'right', charSpacing: 0.8 });

// 3-column flow: SOURCE → CORE → OUTPUT
const flowY  = SOL_Y + 0.44;
const flowH  = 1.55;
const diagW  = W - PAD*2 - 0.32;
const diagX  = PAD + 0.16;
slide.addShape('roundRect', { x: diagX, y: flowY, w: diagW, h: flowH,
  fill: { color: C.offWhite }, line: { color: C.lightGray, pt: 0.5 }, rectRadius: 0.05 });

const colW3  = diagW / 3;

// SOURCE box
slide.addShape('roundRect', { x: diagX + 0.18, y: flowY + 0.42, w: colW3 - 0.28, h: 0.72,
  fill: { color: C.tagBg }, line: { color: C.borderGray, pt: 0.5 }, rectRadius: 0.05 });
slide.addText('SOURCE', { x: diagX + 0.18, y: flowY + 0.46, w: colW3 - 0.28, h: 0.14,
  fontSize: 4.5, bold: true, color: C.crimson, fontFace: 'Open Sans', align: 'center', charSpacing: 0.8 });
slide.addText('CRM & Front\nOffice', { x: diagX + 0.18, y: flowY + 0.61, w: colW3 - 0.28, h: 0.40,
  fontSize: 7, color: C.darkText, fontFace: 'Open Sans', align: 'center', valign: 'middle' });

// Arrow 1
slide.addShape('line', { x: diagX + colW3 - 0.04, y: flowY + 0.78, w: 0.26, h: 0,
  line: { color: C.midGray, pt: 1, endArrowType: 'triangle' } });

// CORE box — dark navy
slide.addShape('roundRect', { x: diagX + colW3 + 0.10, y: flowY + 0.35, w: colW3 - 0.20, h: 0.86,
  fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.06 });
slide.addText('CORE', { x: diagX + colW3 + 0.10, y: flowY + 0.40, w: colW3 - 0.20, h: 0.16,
  fontSize: 4.5, bold: true, color: C.crimson, fontFace: 'Open Sans', align: 'center', charSpacing: 0.8 });
slide.addText('NetSuite\nERP', { x: diagX + colW3 + 0.10, y: flowY + 0.56, w: colW3 - 0.20, h: 0.52,
  fontSize: 9, bold: true, color: C.white, fontFace: 'Open Sans', align: 'center', valign: 'middle' });

// Arrow 2
slide.addShape('line', { x: diagX + colW3*2 - 0.07, y: flowY + 0.78, w: 0.26, h: 0,
  line: { color: C.midGray, pt: 1, endArrowType: 'triangle' } });

// OUTPUT box
slide.addShape('roundRect', { x: diagX + colW3*2 + 0.10, y: flowY + 0.42, w: colW3 - 0.28, h: 0.72,
  fill: { color: C.tagBg }, line: { color: C.borderGray, pt: 0.5 }, rectRadius: 0.05 });
slide.addText('OUTPUT', { x: diagX + colW3*2 + 0.10, y: flowY + 0.46, w: colW3 - 0.28, h: 0.14,
  fontSize: 4.5, bold: true, color: C.crimson, fontFace: 'Open Sans', align: 'center', charSpacing: 0.8 });
slide.addText('Analytics\n& BI', { x: diagX + colW3*2 + 0.10, y: flowY + 0.61, w: colW3 - 0.28, h: 0.40,
  fontSize: 7, color: C.darkText, fontFace: 'Open Sans', align: 'center', valign: 'middle' });

// Caption
slide.addText('Drop the full solution-design schematic here — source systems → NetSuite → analytics', {
  x: diagX, y: flowY + flowH - 0.24, w: diagW, h: 0.20,
  fontSize: 5, color: C.midGray, fontFace: 'Open Sans', align: 'center', italic: true });

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 4: WHY PANELS (3 stacked right-side panels)
// ═══════════════════════════════════════════════════════════════════════════════
const WHY_Y  = SOL_Y + SOL_H + 0.10;
const RPAD   = 0.26;
const RX     = W / 2 + 0.06;   // right column x
const RW     = W - RX - RPAD;
const WHY_PH = 0.82;           // panel height each
const WHY_GAP = 0.08;

const whyPanels = [
  { label: 'WHY NETSUITE', body: deal.whyNetSuite, bg: C.white,    fg: C.darkText, lc: C.crimson },
  { label: 'WHY PLATIVE',  body: deal.whyPlative,  bg: C.white,    fg: C.darkText, lc: C.crimson },
  { label: 'AI SOLUTIONS & CONSIDERATIONS', body: deal.aiNote, bg: C.navyLight, fg: C.white, lc: C.crimson },
];

whyPanels.forEach((p, i) => {
  const py = WHY_Y + i * (WHY_PH + WHY_GAP);
  slide.addShape('roundRect', { x: RX, y: py, w: RW, h: WHY_PH,
    fill: { color: p.bg }, line: { color: p.bg === C.white ? C.borderGray : p.bg, pt: 0.5 }, rectRadius: 0.06 });
  slide.addText(p.label, { x: RX + 0.14, y: py + 0.10, w: RW - 0.20, h: 0.16,
    fontSize: 5.5, bold: true, color: p.lc, fontFace: 'Open Sans', charSpacing: 0.8 });
  slide.addText(p.body, { x: RX + 0.14, y: py + 0.28, w: RW - 0.20, h: WHY_PH - 0.32,
    fontSize: 6.5, color: p.fg, fontFace: 'Open Sans', wrap: true, lineSpacingMultiple: 1.3 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 4 LEFT: Placeholder for custom diagram / additional context
// ═══════════════════════════════════════════════════════════════════════════════
const LX   = PAD;
const LW   = RX - PAD - 0.12;
const totalWhyH = whyPanels.length * (WHY_PH + WHY_GAP) - WHY_GAP;
slide.addShape('roundRect', { x: LX, y: WHY_Y, w: LW, h: totalWhyH,
  fill: { color: C.offWhite }, line: { color: C.lightGray, pt: 0.5 }, rectRadius: 0.06 });
slide.addText('Add supporting visual,\nstats, or key outcomes here.', {
  x: LX + 0.14, y: WHY_Y + totalWhyH/2 - 0.2, w: LW - 0.28, h: 0.40,
  fontSize: 6.5, color: C.midGray, fontFace: 'Open Sans', align: 'center', italic: true });

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 5: CUSTOMER QUOTE STRIP
// ═══════════════════════════════════════════════════════════════════════════════
const QUOTE_Y = WHY_Y + totalWhyH + 0.10;
const QUOTE_H = 0.72;

slide.addShape('rect', { x: 0, y: QUOTE_Y, w: W, h: QUOTE_H,
  fill: { color: C.white }, line: { color: C.borderGray, pt: 0.4 } });
// Left crimson accent bar
slide.addShape('rect', { x: 0, y: QUOTE_Y, w: 0.06, h: QUOTE_H,
  fill: { color: C.crimson }, line: { color: C.crimson } });

slide.addText(`"${deal.quote}"`, { x: 0.20, y: QUOTE_Y + 0.08, w: W - 2.20, h: QUOTE_H - 0.16,
  fontSize: 8, color: C.darkText, fontFace: 'Open Sans', wrap: true, lineSpacingMultiple: 1.3, italic: true });

// Attribution (right-aligned)
slide.addText(deal.quoteAttrib, { x: W - 1.90, y: QUOTE_Y + 0.16, w: 1.64, h: 0.22,
  fontSize: 7, bold: true, color: C.darkText, fontFace: 'Open Sans', align: 'right' });
slide.addText(deal.quoteCompany, { x: W - 1.90, y: QUOTE_Y + 0.38, w: 1.64, h: 0.18,
  fontSize: 6, bold: true, color: C.crimson, fontFace: 'Open Sans', align: 'right', charSpacing: 0.8 });

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 6: BOTTOM THREE PANELS (NetSuite Solution | Implementation | The Teams)
// ═══════════════════════════════════════════════════════════════════════════════
const BOT_Y  = QUOTE_Y + QUOTE_H + 0.10;
const BOT_H  = H - BOT_Y - 0.42;
const colW_b = (W - PAD*2 - 0.16) / 3;
const botBgs = [C.white, C.white, C.navyLight];
const botFg  = [C.darkText, C.darkText, C.white];

// Panel 0: NetSuite Solution
const p0x = PAD;
slide.addShape('roundRect', { x: p0x, y: BOT_Y, w: colW_b, h: BOT_H,
  fill: { color: botBgs[0] }, line: { color: C.borderGray, pt: 0.5 }, rectRadius: 0.06 });
slide.addText('NETSUITE SOLUTION', { x: p0x + 0.14, y: BOT_Y + 0.12, w: colW_b - 0.20, h: 0.16,
  fontSize: 5.5, bold: true, color: C.crimson, fontFace: 'Open Sans', charSpacing: 0.8 });
slide.addText('NETSUITE EDITION', { x: p0x + 0.14, y: BOT_Y + 0.32, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });
slide.addText(deal.edition, { x: p0x + 0.14, y: BOT_Y + 0.47, w: colW_b - 0.20, h: 0.22,
  fontSize: 8, bold: true, color: C.darkText, fontFace: 'Open Sans' });
slide.addText('MODULES', { x: p0x + 0.14, y: BOT_Y + 0.73, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });

// Module pills
let pillX = p0x + 0.14; let pillY = BOT_Y + 0.90; const pillH2 = 0.175; const pillGap = 0.06;
deal.modules.forEach(mod => {
  const approxW = Math.max(0.55, mod.length * 0.062);
  if (pillX + approxW > p0x + colW_b - 0.10) { pillX = p0x + 0.14; pillY += pillH2 + pillGap; }
  addPill(slide, mod, pillX, pillY, approxW);
  pillX += approxW + pillGap;
});

// Integrations sub-section
const integY = Math.min(BOT_Y + 1.55, pillY + pillH2 + 0.18);
slide.addText('INTEGRATIONS', { x: p0x + 0.14, y: integY, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });

let ipX = p0x + 0.14; let ipY = integY + 0.18;
deal.integrations.forEach(integ => {
  const iw = Math.max(0.50, integ.length * 0.058);
  if (ipX + iw > p0x + colW_b - 0.10) { ipX = p0x + 0.14; ipY += pillH2 + pillGap; }
  addPill(slide, integ, ipX, ipY, iw, { bg: 'E8F5F5', fg: '0D7A7F' });
  ipX += iw + pillGap;
});

// Panel 1: Implementation
const p1x = PAD + colW_b + 0.08;
slide.addShape('roundRect', { x: p1x, y: BOT_Y, w: colW_b, h: BOT_H,
  fill: { color: botBgs[1] }, line: { color: C.borderGray, pt: 0.5 }, rectRadius: 0.06 });
slide.addText('IMPLEMENTATION', { x: p1x + 0.14, y: BOT_Y + 0.12, w: colW_b - 0.20, h: 0.16,
  fontSize: 5.5, bold: true, color: C.crimson, fontFace: 'Open Sans', charSpacing: 0.8 });

slide.addText('TIMELINE', { x: p1x + 0.14, y: BOT_Y + 0.33, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });
slide.addText(deal.timeline, { x: p1x + 0.14, y: BOT_Y + 0.48, w: colW_b - 0.20, h: 0.34,
  fontSize: 16, bold: true, color: C.darkText, fontFace: 'Open Sans' });

slide.addText('METHODOLOGY', { x: p1x + 0.14, y: BOT_Y + 0.87, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });
slide.addText(deal.methodology, { x: p1x + 0.14, y: BOT_Y + 1.03, w: colW_b - 0.20, h: 0.22,
  fontSize: 8, bold: true, color: C.darkText, fontFace: 'Open Sans' });

slide.addText('APPROACH', { x: p1x + 0.14, y: BOT_Y + 1.30, w: colW_b - 0.20, h: 0.14,
  fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });
slide.addText(deal.approach, { x: p1x + 0.14, y: BOT_Y + 1.47, w: colW_b - 0.20, h: BOT_H - 1.55,
  fontSize: 6, color: C.darkText, fontFace: 'Open Sans', wrap: true, lineSpacingMultiple: 1.3 });

// Panel 2: The Teams (dark navy)
const p2x = PAD + colW_b*2 + 0.16;
slide.addShape('roundRect', { x: p2x, y: BOT_Y, w: colW_b, h: BOT_H,
  fill: { color: C.navyLight }, line: { color: C.navyLight }, rectRadius: 0.06 });
slide.addText('THE TEAMS', { x: p2x + 0.14, y: BOT_Y + 0.12, w: colW_b - 0.20, h: 0.16,
  fontSize: 5.5, bold: true, color: C.crimson, fontFace: 'Open Sans', charSpacing: 0.8 });

const teamRows = [
  { label: 'NETSUITE',      value: deal.nsAE },
  { label: 'PLATIVE LEAD',  value: deal.platLead },
  { label: 'PLATIVE DELIV', value: deal.platDeliv },
];
teamRows.forEach((row, i) => {
  const ry = BOT_Y + 0.40 + i * 0.56;
  slide.addText(row.label, { x: p2x + 0.14, y: ry, w: colW_b - 0.20, h: 0.14,
    fontSize: 5, bold: true, color: C.midGray, fontFace: 'Open Sans', charSpacing: 0.8 });
  slide.addText(row.value, { x: p2x + 0.14, y: ry + 0.16, w: colW_b - 0.20, h: 0.26,
    fontSize: 9, bold: true, color: C.white, fontFace: 'Open Sans' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 7: FOOTER
// ═══════════════════════════════════════════════════════════════════════════════
const FOOT_Y = H - 0.34;
slide.addShape('rect', { x: 0, y: FOOT_Y, w: W, h: 0.34,
  fill: { color: C.offWhite }, line: { color: C.lightGray, pt: 0.4 } });

const logoHF = 0.13;
slide.addImage({ path: LOGO_DARK, x: 0.22, y: FOOT_Y + 0.10, w: logoHF * LOGO_ASPECT, h: logoHF });

slide.addText('· INFO@PLATIVE.COM · PLATIVE.COM', {
  x: 0.22 + logoHF * LOGO_ASPECT + 0.05, y: FOOT_Y + 0.10, w: 1.60, h: 0.14,
  fontSize: 4.5, color: C.midGray, fontFace: 'Open Sans', valign: 'middle' });

slide.addText('CONFIDENTIAL · NETSUITE CUSTOMER WIN STORY', {
  x: W - 2.20, y: FOOT_Y + 0.10, w: 2.0, h: 0.14,
  fontSize: 4.5, color: C.midGray, fontFace: 'Open Sans', align: 'right', charSpacing: 0.5 });

// ─── Write file ────────────────────────────────────────────────────────────────
const outPath = `/mnt/user-data/outputs/${deal.companySlug}_WinStory.pptx`;
pres.writeFile({ fileName: outPath })
  .then(() => console.log(`✓ Saved: ${outPath}`))
  .catch(err => console.error('Error:', err));
