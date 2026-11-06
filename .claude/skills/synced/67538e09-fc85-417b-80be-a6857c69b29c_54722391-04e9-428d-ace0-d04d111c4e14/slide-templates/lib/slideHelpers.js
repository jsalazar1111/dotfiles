/**
 * Plative Slide Helpers
 *
 * One function per reference layout. Each function adds a fully styled slide
 * to the passed pres (pptxgenjs Presentation) and returns the Slide object.
 *
 * All positioning, colors, and fonts are locked to Plative brand. Callers
 * supply content only.
 */

const path = require('path');
const { COLORS, FONTS, SIZES, LAYOUT, PRES_DEFAULTS } = require('./brandConstants');

const ASSET_DIR = path.join(__dirname, '..', 'assets');
const BG = (name) => path.join(ASSET_DIR, 'backgrounds', name);
const ICON = (tag, name) => path.join(ASSET_DIR, 'icons', tag, name);
const LOGO_LIGHT = path.join(ASSET_DIR, 'plative-logo-light.png');  // black wordmark, for light bg
const LOGO_DARK  = path.join(ASSET_DIR, 'plative-logo-dark.png');   // white wordmark, for dark bg
const LOGO_ASPECT = 3.374;  // width / height of logo PNGs (same for both variants)

const BACKGROUNDS = {
  titleHero:        BG('mountain-sunset.jpg'),
  agendaPanel:      BG('mountain-panel.jpg'),
  navySolid:        BG('navy-solid.jpg'),
  navyGradient:     BG('navy-gradient.jpg'),
  sectionMountains: BG('landscape-mountains.jpg'),
  sectionLake:      BG('landscape-lake.jpg'),
  closing:          BG('mountain-closing.jpg'),
};

function createPresentation() {
  const pptxgen = require('pptxgenjs');
  const pres = new pptxgen();
  // Source deck is 10 x 5.625 (widescreen 16:9). Built-in LAYOUT_WIDE is
  // 13.333 x 7.5 which does NOT match. Define our own.
  pres.defineLayout({ name: 'PLATIVE_WIDE', width: LAYOUT.slideWidth, height: LAYOUT.slideHeight });
  pres.layout = 'PLATIVE_WIDE';
  pres.author = PRES_DEFAULTS.author;
  pres.company = PRES_DEFAULTS.company;
  pres.revision = PRES_DEFAULTS.revision;
  return pres;
}

/**
 * Render the Plative logo (crimson lantern + "PLATIVE" wordmark, as a single
 * branded image) at the given position and height. Image variant swaps based
 * on onDark.
 *
 * @param {Object} slide - pptxgenjs Slide object
 * @param {Object} opts
 * @param {number} opts.x - left edge (inches)
 * @param {number} opts.y - top edge (inches)
 * @param {number} opts.h - total logo height (inches). Width is derived as h * 3.374.
 * @param {boolean} [opts.onDark] - true if slide bg is dark (uses white-wordmark variant)
 */
function renderLogo(slide, { x, y, h, onDark = false }) {
  slide.addImage({
    path: onDark ? LOGO_DARK : LOGO_LIGHT,
    x, y,
    w: h * LOGO_ASPECT,
    h,
  });
}

/**
 * Shortcut: place logo at standard bottom-left position.
 */
function _addLogo(slide, onDark = false) {
  renderLogo(slide, { x: LAYOUT.logo.x, y: LAYOUT.logo.y, h: LAYOUT.logo.h, onDark });
}

function _addPageNumber(slide, pageNum, onDark = false) {
  slide.addText(String(pageNum), {
    x: LAYOUT.pageNum.x, y: LAYOUT.pageNum.y,
    w: LAYOUT.pageNum.w, h: LAYOUT.pageNum.h,
    fontFace: FONTS.body, fontSize: SIZES.pageNumber,
    color: onDark ? COLORS.white : COLORS.darkText,
    align: 'right', valign: 'middle', margin: 0,
  });
}

function _addFullBleedBg(slide, imagePath) {
  slide.background = { path: imagePath };
}

// ============================================================================
// 1. TITLE SLIDE
// ============================================================================
function addTitleSlide(pres, { title, subtitle = '', date = '' }) {
  const slide = pres.addSlide();
  _addFullBleedBg(slide, BACKGROUNDS.titleHero);

  if (date) {
    slide.addText(date, {
      x: 0.34, y: 0.43, w: 3.00, h: 0.30,
      fontFace: FONTS.body, fontSize: SIZES.heroDate, color: COLORS.white,
      align: 'left', valign: 'middle', margin: 0,
    });
    slide.addShape('line', {
      x: 0.34, y: 0.78, w: 0.50, h: 0,
      line: { color: COLORS.gold, width: 1 },
    });
  }

  slide.addText(title, {
    x: 0.34, y: 2.10, w: 7.50, h: 1.30,
    fontFace: FONTS.title, fontSize: SIZES.heroTitle, color: COLORS.white,
    align: 'left', valign: 'middle', margin: 0,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.34, y: 3.45, w: 7.50, h: 0.42,
      fontFace: FONTS.subtitle, fontSize: SIZES.heroSubtitle, color: COLORS.softTeal,
      align: 'left', valign: 'middle', margin: 0,
    });
  }

  // Title slide uses bottom-RIGHT logo (matches source reference)
  renderLogo(slide, { x: 8.40, y: 5.22, h: 0.30, onDark: true });
  return slide;
}

// ============================================================================
// 2. AGENDA SLIDE
// ============================================================================
function addAgendaSlide(pres, { items, title = 'Agenda', pageNum = null }) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };

  slide.addImage({
    path: BACKGROUNDS.agendaPanel,
    x: 0, y: 0, w: 3.61, h: LAYOUT.slideHeight,
    sizing: { type: 'cover', w: 3.61, h: LAYOUT.slideHeight },
  });
  slide.addShape('rect', {
    x: 0, y: 0, w: 3.61, h: LAYOUT.slideHeight,
    fill: { color: COLORS.navy, transparency: 40 },
    line: { type: 'none' },
  });

  slide.addText(title, {
    x: 0.34, y: 2.30, w: 3.00, h: 0.90,
    fontFace: FONTS.title, fontSize: 32, color: COLORS.white,
    align: 'left', valign: 'middle', margin: 0,
  });

  const startY = 1.11;
  const rowHeight = 0.50;
  items.forEach((item, i) => {
    const y = startY + i * rowHeight;
    slide.addText(String(i + 1), {
      x: 4.20, y, w: 0.45, h: 0.42,
      fontFace: FONTS.title, fontSize: 16, color: COLORS.softNavy,
      align: 'left', valign: 'middle', margin: 0,
    });
    slide.addText(item, {
      x: 4.75, y, w: 4.80, h: 0.42,
      fontFace: FONTS.body, fontSize: SIZES.bodyLarge, color: COLORS.darkText,
      align: 'left', valign: 'middle', margin: 0,
    });
    if (i < items.length - 1) {
      slide.addShape('line', {
        x: 4.20, y: y + 0.47, w: 5.30, h: 0,
        line: { color: COLORS.lightGray, width: 0.5 },
      });
    }
  });

  _addLogo(slide, true);
  if (pageNum !== null) _addPageNumber(slide, pageNum, false);
  return slide;
}

// ============================================================================
// 3. THREE-BOX CONTENT SLIDE
// ============================================================================
function addThreeBoxSlide(pres, { title, boxes, pageNum = null }) {
  if (boxes.length !== 3) {
    throw new Error(`addThreeBoxSlide expects exactly 3 boxes, got ${boxes.length}`);
  }
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText(title, {
    x: 0.34, y: 0.49, w: 9.32, h: 0.63,
    fontFace: FONTS.title, fontSize: SIZES.slideTitle, color: COLORS.navy,
    align: 'left', valign: 'middle', margin: 0,
  });
  slide.addShape('line', {
    x: 0.34, y: 1.18, w: 9.32, h: 0,
    line: { color: COLORS.softNavy, width: 0.75 },
  });

  const boxX = [0.40, 3.55, 6.70];
  const boxW = 2.90;
  const headerH = 0.40;
  const bodyY = 2.54;
  const bodyH = 1.48;

  boxes.forEach((box, i) => {
    const x = boxX[i];
    slide.addShape('rect', {
      x, y: 2.14, w: boxW, h: headerH,
      fill: { color: COLORS.navy }, line: { type: 'none' },
    });
    slide.addText(box.header, {
      x, y: 2.14, w: boxW, h: headerH,
      fontFace: FONTS.bodyBold, fontSize: SIZES.body, color: COLORS.white,
      align: 'center', valign: 'middle', margin: 0, bold: true,
    });
    slide.addShape('rect', {
      x, y: bodyY, w: boxW, h: bodyH,
      fill: { color: COLORS.offWhite }, line: { type: 'none' },
    });
    slide.addText(box.body, {
      x: x + 0.15, y: bodyY + 0.10, w: boxW - 0.30, h: bodyH - 0.20,
      fontFace: FONTS.body, fontSize: SIZES.body, color: COLORS.darkText,
      align: 'left', valign: 'top', margin: 0,
    });
  });

  _addLogo(slide, false);
  if (pageNum !== null) _addPageNumber(slide, pageNum, false);
  return slide;
}

// ============================================================================
// 4. FINDINGS SLIDE
// ============================================================================
function addFindingsSlide(pres, { title, whatWeHeard, recommendations, impacts, pageNum = null }) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText(title, {
    x: 0.34, y: 0.49, w: 9.32, h: 0.63,
    fontFace: FONTS.title, fontSize: SIZES.slideTitle, color: COLORS.navy,
    align: 'left', valign: 'middle', margin: 0,
  });
  slide.addShape('line', {
    x: 0.34, y: 1.18, w: 9.32, h: 0,
    line: { color: COLORS.softNavy, width: 0.75 },
  });

  const cols = [
    { x: 0.66, label: 'WHAT WE HEARD',               underlineW: 0.55 },
    { x: 3.76, label: 'RECOMMENDATION',              underlineW: 0.68 },
    { x: 6.84, label: 'ANTICIPATED BUSINESS IMPACT', underlineW: 0.35 },
  ];

  cols.forEach((col) => {
    slide.addText(col.label, {
      x: col.x, y: 2.15, w: 2.51, h: 0.28,
      fontFace: FONTS.bodyBold, fontSize: SIZES.bodySmall, color: COLORS.navy,
      align: 'left', valign: 'middle', margin: 0, bold: true,
    });
    slide.addShape('line', {
      x: col.x, y: 2.48, w: col.underlineW, h: 0,
      line: { color: COLORS.crimson, width: 1.5 },
    });
  });

  const rowYs = [2.61, 3.29];
  const rowH = 0.57;
  const cardW = 2.47;

  whatWeHeard.slice(0, 2).forEach((text, i) => {
    slide.addShape('rect', {
      x: 0.68, y: rowYs[i], w: cardW, h: rowH,
      fill: { color: COLORS.offWhite }, line: { type: 'none' },
    });
    slide.addText(text, {
      x: 0.78, y: rowYs[i] + 0.03, w: cardW - 0.20, h: rowH - 0.06,
      fontFace: FONTS.body, fontSize: SIZES.bodySmall, color: COLORS.darkText,
      align: 'left', valign: 'middle', margin: 0,
    });
  });

  recommendations.slice(0, 2).forEach((text, i) => {
    slide.addShape('rect', {
      x: 3.78, y: rowYs[i], w: cardW, h: rowH,
      fill: { color: COLORS.offWhite }, line: { type: 'none' },
    });
    slide.addText(text, {
      x: 3.88, y: rowYs[i] + 0.03, w: cardW - 0.20, h: rowH - 0.06,
      fontFace: FONTS.body, fontSize: SIZES.bodySmall, color: COLORS.darkText,
      align: 'left', valign: 'middle', margin: 0,
    });
  });

  const dirSymbol = { up: '▲', down: '▼', flat: '▶' };
  const dirColor = { up: COLORS.deepTeal, down: COLORS.crimson, flat: COLORS.softNavy };
  const impactHeight = (rowYs[1] + rowH) - rowYs[0];
  slide.addShape('rect', {
    x: 6.86, y: rowYs[0], w: cardW, h: impactHeight,
    fill: { color: COLORS.offWhite }, line: { type: 'none' },
  });
  const impactStartY = rowYs[0] + 0.08;
  const impactStep = 0.34;
  impacts.slice(0, 3).forEach((imp, i) => {
    const y = impactStartY + i * impactStep;
    slide.addText([
      { text: dirSymbol[imp.direction] + ' ', options: { color: dirColor[imp.direction], bold: true } },
      { text: imp.text, options: { color: COLORS.darkText } },
    ], {
      x: 7.00, y, w: 2.30, h: 0.28,
      fontFace: FONTS.body, fontSize: SIZES.bodySmall,
      align: 'left', valign: 'middle', margin: 0,
    });
  });

  [3.28, 6.37].forEach((x) => {
    [2.78, 3.45].forEach((y) => {
      slide.addText('▶', {
        x, y, w: 0.37, h: 0.25,
        fontFace: FONTS.body, fontSize: 14, color: COLORS.softNavy,
        align: 'center', valign: 'middle', margin: 0, bold: true,
      });
    });
  });

  _addLogo(slide, false);
  if (pageNum !== null) _addPageNumber(slide, pageNum, false);
  return slide;
}

// ============================================================================
// 5. SECTION DIVIDER - DARK
// ============================================================================
function addSectionDividerDark(pres, { title, subtitle = '', pageNum = null }) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.navy };

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.34, y: 2.15, w: 9.08, h: 0.30,
      fontFace: FONTS.subtitle, fontSize: SIZES.sectionSubtitle, color: COLORS.softTeal,
      align: 'left', valign: 'middle', margin: 0,
    });
  }

  slide.addText(title, {
    x: 0.34, y: 2.50, w: 9.32, h: 0.90,
    fontFace: FONTS.title, fontSize: SIZES.sectionTitle, color: COLORS.white,
    align: 'left', valign: 'middle', margin: 0,
  });

  _addLogo(slide, true);
  if (pageNum !== null) _addPageNumber(slide, pageNum, true);
  return slide;
}

// ============================================================================
// 6. TABLE SLIDE
// ============================================================================
function addTableSlide(pres, { title, subtitle = '', columns, rows, pageNum = null }) {
  const slide = pres.addSlide();
  _addFullBleedBg(slide, BACKGROUNDS.navyGradient); // light-to-gray gradient

  slide.addText(title, {
    x: 0.34, y: 0.49, w: 9.32, h: 0.63,
    fontFace: FONTS.title, fontSize: SIZES.slideTitle, color: COLORS.navy,
    align: 'left', valign: 'middle', margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.34, y: 1.14, w: 9.08, h: 0.30,
      fontFace: FONTS.subtitle, fontSize: SIZES.slideSubtitle, color: COLORS.teal,
      align: 'left', valign: 'middle', margin: 0,
    });
  }

  const headerRow = columns.map((c) => ({
    text: c,
    options: {
      bold: true, color: COLORS.white, fill: { color: COLORS.navy },
      align: 'left', valign: 'middle',
      fontFace: FONTS.bodyBold, fontSize: SIZES.tableHeader,
    },
  }));
  const bodyRows = rows.map((r) =>
    r.map((cell) => ({
      text: String(cell),
      options: {
        color: COLORS.darkText, fill: { color: COLORS.white },
        align: 'left', valign: 'middle',
        fontFace: FONTS.body, fontSize: SIZES.tableCell,
      },
    }))
  );

  slide.addTable([headerRow, ...bodyRows], {
    x: 0.50, y: 1.80, w: 9.00,
    border: { type: 'solid', color: COLORS.lightGray, pt: 0.5 },
    rowH: 0.34,
  });

  _addLogo(slide, false);
  if (pageNum !== null) _addPageNumber(slide, pageNum, false);
  return slide;
}

// ============================================================================
// 7. SECTION DIVIDER - LANDSCAPE
// ============================================================================
function addSectionDividerLandscape(pres, { title, subtitle = '', variant = 'mountains', pageNum = null }) {
  const slide = pres.addSlide();
  const bg = variant === 'lake' ? BACKGROUNDS.sectionLake : BACKGROUNDS.sectionMountains;
  _addFullBleedBg(slide, bg);

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.89, y: 2.00, w: 4.21, h: 0.26,
      fontFace: FONTS.subtitle, fontSize: SIZES.sectionSubtitle, color: COLORS.softTeal,
      align: 'left', valign: 'middle', margin: 0,
    });
  }

  slide.addText(title, {
    x: 0.89, y: 2.40, w: 7.50, h: 1.60,
    fontFace: FONTS.title, fontSize: SIZES.sectionTitle, color: COLORS.white,
    align: 'left', valign: 'top', margin: 0,
  });

  _addLogo(slide, true);
  if (pageNum !== null) _addPageNumber(slide, pageNum, true);
  return slide;
}

// ============================================================================
// 8. CLOSING SLIDE
// ============================================================================
function addClosingSlide(pres, { closingText = '' } = {}) {
  const slide = pres.addSlide();
  _addFullBleedBg(slide, BACKGROUNDS.closing);

  // Large centered logo. Total width ~3.5" centered on 10" slide.
  renderLogo(slide, { x: 3.50, y: 2.55, h: 0.55, onDark: true });

  if (closingText) {
    slide.addText(closingText, {
      x: 0.34, y: 3.40, w: 9.32, h: 0.60,
      fontFace: FONTS.subtitle, fontSize: 18, color: COLORS.white,
      align: 'center', valign: 'middle', margin: 0,
    });
  }

  return slide;
}

module.exports = {
  createPresentation,
  addTitleSlide,
  addAgendaSlide,
  addThreeBoxSlide,
  addFindingsSlide,
  addSectionDividerDark,
  addSectionDividerLandscape,
  addTableSlide,
  addClosingSlide,
  renderLogo,
  COLORS, FONTS, SIZES, LAYOUT,
  BACKGROUNDS, ICON, LOGO_LIGHT, LOGO_DARK,
};
