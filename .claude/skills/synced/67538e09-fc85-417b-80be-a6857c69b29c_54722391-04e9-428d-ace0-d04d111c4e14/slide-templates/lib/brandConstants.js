/**
 * Plative Brand Constants
 * Canonical values from references/brand-specs.md. Use these, do not approximate.
 */

// ============================================================================
// COLORS (exact hex, no #)
// ============================================================================
const COLORS = {
  // Primary
  crimson:   'E14136',  // primary accent, logo, CTAs
  navy:      '262A42',  // dark backgrounds, headers
  softNavy:  '425582',  // secondary dark elements
  gold:      'DEAB57',  // accent highlights

  // Secondary
  deepTeal:  '005957',
  teal:      '0D9DA4',
  softTeal:  '9CDAE6',

  // Neutrals
  white:     'FFFFFF',
  offWhite:  'F5F6FA',  // subtle light panel fill
  lightGray: 'DCDDDE',  // dividers, borders
  midGray:   '59575C',  // muted body copy
  darkText:  '323232',  // standard body text on light bg
  black:     '000000',
};

// ============================================================================
// TYPOGRAPHY (Open Sans family only)
// ============================================================================
const FONTS = {
  title:    'Open Sans Semibold',
  subtitle: 'Open Sans Light',
  body:     'Open Sans',
  bodyBold: 'Open Sans Semibold',
};

const SIZES = {
  // Title slide
  heroTitle:      40,
  heroSubtitle:   14,
  heroDate:       10,

  // Content slides
  slideTitle:     24,
  slideSubtitle:  12,

  // Section dividers
  sectionTitle:   44,
  sectionSubtitle: 12,

  // Body content
  bodyLarge: 14,
  body:      11,
  bodySmall: 10,
  caption:   9,

  // Table
  tableHeader: 11,
  tableCell:   10,

  // Page numbers
  pageNumber: 9,
};

// ============================================================================
// LAYOUT DIMENSIONS (inches, 16:9 at 10 x 5.625)
// ============================================================================
const LAYOUT = {
  slideWidth:  10.0,
  slideHeight: 5.625,

  // Content area margins
  marginLeft:  0.34,
  marginRight: 0.34,
  marginTop:   0.49,

  // Logo position (bottom-left) - height only; width is derived from height
  logo: { x: 0.28, y: 5.26, h: 0.28 },

  // Page number (bottom-right)
  pageNum: { x: 9.40, y: 5.22, w: 0.35, h: 0.35 },
};

// ============================================================================
// PRESENTATION SETUP
// ============================================================================
const PRES_DEFAULTS = {
  layout:      'LAYOUT_WIDE',      // 10 x 5.625 (matches source deck)
  author:      'Plative',
  company:     'Plative',
  revision:    '1',
};

module.exports = { COLORS, FONTS, SIZES, LAYOUT, PRES_DEFAULTS };
