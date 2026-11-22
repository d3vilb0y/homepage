# NSALABB brand kit

The look every nsalabb.se service shares: a prompt under a matte black night sky, F5 red for the one action and army green beside it.
The logo is concept "Prompt": an n and an amber terminal cursor. The source is `src/shared/brand.ts`; everything else in this folder is
generated from it by `npm run brand` (and a test fails if it isn't), so don't edit these files by hand.

| File | Use it for |
| --- | --- |
| `nsalabb.css` | CSS custom properties (`--nl-*`). Copy it into a web app and use the variables. |
| `tokens.json` | The same values for anything that isn't CSS: another app's theme, Grafana, a dashboard config. |
| `mark.svg` | The n_ glyph on dark backgrounds, no tile. |
| `mark-paper.svg` | The n_ glyph on light backgrounds. |
| `app-icon.svg` | The glyph on its rounded tile. |
| `logo/` | Ted's logo files exactly as delivered: SVG and PNG lockups, icons, `favicon.ico`, and its own README. Use these for favicons and home-screen icons. |

## Naming

- The brand is **nsalabb**, always lowercase, written as a prompt: `nsalabb_` in JetBrains Mono 500,
  the underscore in the cursor amber.
- A product adds a divider and its path: `nsalabb_ | ~/services`, `~/playgate`, `~/share`
  ("~/" in amber, the name in `--nl-logo-path`). The tile sits to the left.
- On small screens, show the tile alone.
- The logo keeps its own colours (`--nl-logo-*`, `logo` in `tokens.json`); the amber cursor is not the UI accent.

## Colour, and how much of it

Roughly 60% matte black ground (`--nl-bg`), 18% slate surfaces, 14% off-white ink, 5% red accent and 3% army green.

- **F5 red** (`--nl-accent`, #e4002b) is the one thing to do on a screen: the primary button, progress, the current tab.
  Text on it uses `--nl-accent-ink`. For red as small text on the dark ground use `--nl-accent-text`.
- **Army green** (`--nl-support`, #8a9a52) supports the red: icons, the two quiet units in the mark, and anything running right now.
- `--nl-ok`, `--nl-warn` and `--nl-danger` are for state only, never decoration. Status badges use the
  `--nl-tone-*` pairs (a dark fill with light text in the same hue).
- On light backgrounds use the `paper` colours from `tokens.json`; the accent deepens so it stays readable.

## Type

IBM Plex Sans for everything you read, IBM Plex Mono for counts, sizes, codes and times. Both are
open (SIL OFL); services.nsalabb.se self-hosts them through `@fontsource-variable/ibm-plex-sans` and
`@fontsource/ibm-plex-mono`. The font stacks fall back to the system UI font.

## The starfield

Behind every page sits a quiet starfield: about one dim star per 9,000 px², twinkling slowly and drifting
sideways, mostly ink with a rare red or army green one. No lines between them. It stops for
`prefers-reduced-motion` and pauses in hidden tabs. The maths is in `src/shared/starfield.ts`
(dependency-free, copy it as is); `src/web/Starfield.tsx` shows how to draw it on a canvas.
