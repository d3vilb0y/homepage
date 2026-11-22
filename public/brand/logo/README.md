# nsalabb — brand kit (Concept B, "Prompt")

## Colours
| Token | Hex | Use |
|---|---|---|
| ink | `#0D1117` | primary dark, icon tile |
| panel | `#161B22` | icon tile on dark backgrounds |
| paper | `#F5F3EE` | light background, glyph on dark |
| amber | `#F5B342` | cursor accent (on dark) |
| amber-deep | `#A86A0C` | cursor accent (on light) |

Fonts: JetBrains Mono 500 (wordmark), Space Grotesk (UI). All SVG text is outlined — no font needed.

## Files
- `favicon.ico` — 16/32/48, place in site root
- `svg/favicon.svg` — modern browsers (32px+); `svg/favicon-16.svg` is a heavier cut for 16px
- `svg/nsalabb-icon.svg` — main app icon; `svg/nsalabb-icon-mini.svg` — amber mini variant
- `svg/nsalabb-mark-on-dark|light.svg` — bare `n_` glyph, no tile
- `svg/nsalabb-lockup-dark|light.svg` — icon + wordmark (top bar)
- `svg/nsalabb-wordmark-dark|light.svg` — wordmark only
- `svg/nsalabb-services-dark|light.svg` — `nsalabb_ | ~/services`
- `png/` — apple-touch-icon (180), PWA 192/512, maskable 512, lockups @2x
- `site.webmanifest`

## `<head>` snippet
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0D1117">
```
Copy `favicon.ico`, `svg/favicon.svg` and everything in `png/` you reference to the site root (or adjust paths).

## Top bar usage
Dark bar: `nsalabb-lockup-dark.svg` at 30–32px height. Light bar: `nsalabb-lockup-light.svg`.
Keep at least 0.5× icon height of clear space around lockups.
