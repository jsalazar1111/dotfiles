# Chiron Brand Asset Package: Light Bulb Mark

## Context

Chiron is Plative's internal AI tutor and coach. It teaches Plative consultants agentic Salesforce and NetSuite delivery techniques. It joins two other Greek-named internal tools: Plaito (Slack AI agent) and Metis (BI dashboard).

The name comes from Chiron, the centaur who trained Greek heroes. Pronounce it KY-ron.

The mark is a light bulb with a Crimson star in place of the filament and three light rays above. It represents insight and imagination. The star links back to Chiron's constellation (Sagittarius).

## Package Contents

| File | Use |
| --- | --- |
| `svg/chiron-mark-on-dark.svg` | Mark only, Gold strokes, transparent. For Navy or dark backgrounds. |
| `svg/chiron-mark-on-light.svg` | Mark only, Navy strokes, transparent. For white or light backgrounds. |
| `svg/chiron-avatar.svg` | Circular Navy avatar with Gold mark. Primary Slack app icon. |
| `svg/chiron-avatar-square.svg` | Square Navy avatar. For platforms that apply their own corner mask. |
| `svg/chiron-lockup-on-dark.svg` | Mark plus CHIRON wordmark on Navy. |
| `svg/chiron-lockup-on-light.svg` | Mark plus CHIRON wordmark, transparent, Navy text. |
| `png/chiron-avatar-{32,64,128,256,512}.png` | Rasterized circular avatar. |
| `png/chiron-avatar-square-{32,64,128,256,512}.png` | Rasterized square avatar. Use the 512 px version for Slack app upload. |
| `png/chiron-mark-on-{dark,light}-512.png` | Rasterized mark only. |

## Colors

Use these exact hex values. They come from Plative brand guidelines.

| Name | Hex | Role |
| --- | --- | --- |
| Navy Blue | `#262A42` | Avatar background, mark strokes on light backgrounds, wordmark on light |
| Gold | `#DEAB57` | Mark strokes on dark backgrounds |
| Crimson | `#E14136` | Star only. Never change. |
| White | `#FFFFFF` | Wordmark on dark backgrounds |
| Soft Teal | `#9CDAE6` | Optional tagline color on dark backgrounds |

## Typography

- Wordmark: CHIRON in all caps, Open Sans Semi Bold (600), wide letter spacing (about 13% of font size).
- Tagline (optional): "Your delivery coach" in Open Sans Light (300).
- The lockup SVGs use live text. Convert the wordmark to outlines before production use, or make sure Open Sans is installed.

## Mark Geometry

All coordinates sit in a 100 x 100 unit grid. The mark SVGs use viewBox `0 -3 100 103` to give the top ray's rounded cap room.

- Bulb outline: 4-unit stroke, round joins.
- Base: two horizontal lines, 4-unit stroke, round caps.
- Star: 8-point star centered at (50, 40), radius 13, Crimson fill.
- Rays: three lines, 3-unit stroke, round caps. All three start 33 units from the bulb center (50, 38) and end at 38 units. Rays sit at 12, 10:30, and 1:30 clock positions.
- Avatar: the mark scales to 68% of the avatar width, centered.

## Usage Rules

- Keep the star Crimson in every version. It is the only Crimson element.
- Do not recolor the mark outside the two approved variants (Gold on dark, Navy on light).
- Do not stretch, rotate, add shadows, gradients, or outlines.
- Keep clear space around the mark equal to the height of the star on all sides.
- Minimum size: 32 px for the avatar. Below that, use the avatar without the rays only if a designer approves it.
- Maintain high contrast: never place the Navy mark on a dark background or the Gold mark on a light background.

## Status

These are concept-stage assets generated as vector drawings. Before launch, a designer should refine line weights, confirm optical balance, and outline the wordmark. The Plative parent logo (crimson lantern) is not included in this package.
