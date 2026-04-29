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
- `public/index.html` — the entire page content. Sections are: hero, `#bio`, `#expertise`, `#interests`, footer. Updating personal info means editing this file.
- `public/styles.css` — neo-futuristic dark theme. All colors and fonts are CSS custom properties on `:root` (`--bg`, `--accent`, `--accent-2`, `--accent-3`, `--mono`, `--sans`, etc.). Fonts (JetBrains Mono + Space Grotesk) load from Google Fonts via `<link>` in the HTML.

The visual shell (animated grid, scanlines, drifting glows) is built from four absolutely-positioned `aria-hidden` divs at the top of `<body>`. There is no JavaScript.

## Important: this is Workers, not Pages

A previous iteration was set up as Cloudflare Pages and failed in CI with: *"It looks like you've run a Workers-specific command in a Pages project."* The project was switched to Workers Static Assets. **Do not** reintroduce `wrangler pages deploy`, `pages_build_output_dir`, or Pages-style config — the deploy command is `wrangler deploy` and the assets binding lives under `[assets]`.

## Content conventions

- Section headers use a `// section-name` style with a numeric `.section-tag` (01, 02, 03).
- Expertise cards reuse the `.project` / `.projects` classes (the markup predates the rename from "projects" to "expertise"). Each card has a `.tag` for technology labels and a `.meta-ok` pill for status.
- The site owner is **d3vilb0y**, a cybersecurity engineer in Jönköping, Sweden. Tone is terse, mono-typed, lowercase-friendly. Keep it that way unless asked otherwise.
