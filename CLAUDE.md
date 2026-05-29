# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install          # install wrangler v4
npm run dev          # local preview at http://localhost:8787 via `wrangler dev`
npm run deploy       # `wrangler deploy` — uploads public/ to Cloudflare Workers
npx wrangler login   # one-time auth before first deploy
```

There is no build step, no test suite, and no linter. Static files are served as-is.

## Architecture

This is a **Cloudflare Worker** that uses the [Static Assets](https://developers.cloudflare.com/workers/static-assets/) feature to serve a single-page personal site. There is intentionally **no Worker script** — `wrangler.toml` binds `./public` as the assets directory and Cloudflare's runtime handles serving directly.

Three files do all the work:

- `wrangler.toml` — `name = "homepage"`, `[assets] directory = "./public"`, `not_found_handling = "single-page-application"` (so unknown paths fall back to `index.html`).
- `public/index.html` — the entire page content. Sections are: intro (no heading), `#about`, `#work`, `#interests`, footer. Updating personal info means editing this file.
- `public/styles.css` — monochrome dark design system. Tokens live as CSS custom properties on `:root`: surfaces (`--bg`, `--surface`, `--border`, `--border-strong`), text (`--text`, `--text-dim`, `--text-faint`), a single `--accent`, type (`--sans`, `--mono`), layout (`--content-width`, `--gutter`), and `--ease`. Fonts (Space Grotesk + JetBrains Mono) load from Google Fonts via `<link>` in the HTML.

There is no JavaScript.

## Important: this is Workers, not Pages

A previous iteration was set up as Cloudflare Pages and failed in CI with: *"It looks like you've run a Workers-specific command in a Pages project."* The project was switched to Workers Static Assets. **Do not** reintroduce `wrangler pages deploy`, `pages_build_output_dir`, or Pages-style config — the deploy command is `wrangler deploy` and the assets binding lives under `[assets]`.

## Design conventions

The current design is intentionally restrained — type-driven hierarchy, monochrome with a single muted accent, hairline rules instead of card surfaces. When making changes, preserve these rules:

- **One accent.** `--accent` (cyan-300) is used only for `<em>` inside the h1, `:focus-visible` rings, and `::selection`. Don't reintroduce gradient text, gradient buttons, or multi-accent palettes.
- **Mono is for technical bits only** — kicker, nav, brand, section number (`.num`), stack `<dt>`, work `.tags`, footer. Body copy is Space Grotesk.
- **Single column, ~720px content width** (`--content-width`). The sticky header, main, and footer all share `.row` as the centered container.
- **Hairlines, not boxes.** Sections separate with 1px `--border` rules under `h2`. Work entries are `<li>` rows with top borders, no cards. The only hover motion is `.work li` shifting 8px right.
- **No ambient effects.** No scanlines, animated grids, drifting glows, or pulsing dots. No status pills.
- Section headings are `<h2>` with a small mono `.num` ("01", "02", "03") preceding the name. Anchors are `#about`, `#work`, `#interests`.
- The site owner is **d3vilb0y**, a cybersecurity engineer in Jönköping, Sweden. Tone is terse, professional, lowercase-friendly. Keep it that way unless asked otherwise.

## Accessibility

- Skip link (`.skip`) targets `#main`.
- Sections use `aria-labelledby` referencing their `h2` id.
- `:focus-visible` is styled with the accent.
- Motion respects `prefers-reduced-motion`.
