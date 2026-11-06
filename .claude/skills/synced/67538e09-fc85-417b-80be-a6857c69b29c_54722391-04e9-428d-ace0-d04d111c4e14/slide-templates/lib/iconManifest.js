/**
 * Icon Manifest
 *
 * 50 approved Plative icons, each available in two variants:
 *   - icons/light/*.png (for use on white/light backgrounds; icons are dark-on-teal)
 *   - icons/dark/*.png  (for use on navy/dark backgrounds; icons are light-on-teal)
 *
 * Icons are named by grid position from the source reference slides:
 *   icon_r{row}_c{col}.png   where row is 1-5, col is 1-10
 *
 * Use by passing the path to pres.addImage() with sizing ~0.5" square.
 *
 * Example:
 *   const { ICON } = require('./lib/slideHelpers');
 *   slide.addImage({ path: ICON('light', 'icon_r1_c1.png'), x: 1, y: 1, w: 0.5, h: 0.5 });
 */

const ROWS = 5;
const COLS = 10;

function allIconNames() {
  const out = [];
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      out.push(`icon_r${r}_c${c}.png`);
    }
  }
  return out;
}

module.exports = {
  ROWS,
  COLS,
  allIconNames,
  count: ROWS * COLS,
  variants: ['light', 'dark'],
};
