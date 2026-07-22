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

This is a **Cloudflare Worker** that uses the [Static Assets](https://developers.cloudflare.com/workers/static-assets/) feature to serve a single-page personal site. Serving is almost entirely handled by Cloudflare's asset runtime — `wrangler.toml` binds `./public` as the assets directory. A **minimal Worker script** exists for one purpose only: gating a secret-code contact reveal (see "Secret-code contact gate" below).

Key files:

- `wrangler.toml` — `name = "homepage"`, `main = "src/index.js"`, `[assets] directory = "./public"`, `binding = "ASSETS"`, `not_found_handling = "single-page-application"` (so unknown paths fall back to `index.html`), and `run_worker_first = ["/unlock"]` so the Worker only runs for the gate path; everything else is served straight from static assets.
- `src/index.js` — the Worker. It intercepts only `/unlock?c=<code>`; all other traffic bypasses it via `run_worker_first`.
- `public/index.html` — the entire page content. Sections are: intro (no heading), `#about`, `#work`, `#interests`, footer. Updating personal info means editing this file.
- `public/styles.css` — monochrome dark design system. Tokens live as CSS custom properties on `:root`: surfaces (`--bg`, `--surface`, `--border`, `--border-strong`), text (`--text`, `--text-dim`, `--text-faint`), a single `--accent`, type (`--sans`, `--mono`), layout (`--content-width`, `--gutter`), and `--ease`. Fonts (Space Grotesk + JetBrains Mono) load from Google Fonts via `<link>` in the HTML.

There is **no client-side JavaScript** — the page itself ships zero JS. The only script is the server-side Worker gate.

## Secret-code contact gate

`src/index.js` reveals contact details (email + phone) only when `/unlock?c=<code>` is requested with the correct code — the URL written to an NFC tag. On a match, the Worker fetches the normal `index.html` from the `ASSETS` binding and injects a **contact pop-up** — a dimmed-backdrop overlay with a centered card (`.reveal`) — plus its scoped `<style>` before returning the page (with `no-store` / `noindex`). The pop-up needs no client-side JS: its backdrop and `×` are links back to `/`, so navigating to the clean page dismisses it. The code and the contact details are **Worker secrets**, never committed to the repo and never present in the public HTML.

Secrets (set with `wrangler secret put <NAME>`; locally, copy `.dev.vars.example` to `.dev.vars`):

- `SECRET_CODE` — the code embedded in the NFC tag URL.
- `CONTACT_EMAIL` — Arrow email to reveal.
- `CONTACT_PHONE` — phone number to reveal.

The pop-up markup and styles are injected by the Worker only in the unlocked response (they never touch `public/`), and reuse the existing design tokens/classes (`--surface`, `--border-strong`, `.kicker`, `.prompt`, `.stack`) so the reveal matches the rest of the page.

## Important: this is Workers, not Pages

A previous iteration was set up as Cloudflare Pages and failed in CI with: *"It looks like you've run a Workers-specific command in a Pages project."* The project was switched to Workers Static Assets. **Do not** reintroduce `wrangler pages deploy`, `pages_build_output_dir`, or Pages-style config — the deploy command is `wrangler deploy` and the assets binding lives under `[assets]`.

## Design conventions

The current design is intentionally restrained — type-driven hierarchy, monochrome with a single muted accent, hairline rules instead of card surfaces. When making changes, preserve these rules:

- **One accent.** `--accent` (cyan-300) is used only for `<em>` inside the h1, the `~$` prompt, the brand caret, the `.now` left border, hovered work-row numbers, `:focus-visible` rings, and `::selection`. Don't reintroduce gradient text, gradient buttons, or multi-accent palettes.
- **Mono is for technical bits only** — kicker, nav, brand, section number (`.num`), section path (`.path`), `.now` line, stack `<dt>`, work `.tags`, footer. Body copy is Space Grotesk.
- **Single column, ~720px content width** (`--content-width`). The sticky header, main, and footer all share `.row` as the centered container.
- **Hairlines, not boxes.** Sections separate with 1px `--border` rules under `h2`. Work entries are `<li>` rows with top borders, no cards. The only hover motion is `.work li` shifting 8px right (its leading number turns accent).
- **Terminal flavor, kept quiet.** The techie touches are: a `~$ whoami` kicker, a blinking caret on the header brand (the only animation; respects reduced-motion), bracketed section indices (`[01]`) with a faint `~/section` path on the right, CSS-counter numbering on work rows, a `.now` status line for the current role, an `EOF` mark in the footer, and a static dot grid on `body` (no animated backgrounds, scanlines, or glows).
- Section headings are `<h2>` with a small mono `.num` ("01", "02", "03") preceding the name. Anchors are `#about`, `#work`, `#interests`.
- The site owner is **Ted Nordvall** (handle **d3vilb0y**), a cybersecurity engineer in Jönköping, Sweden, currently Product Specialist — Cybersecurity at Arrow ECS. Tone is terse, professional, lowercase-friendly. Keep it that way unless asked otherwise.

## Accessibility

- Skip link (`.skip`) targets `#main`.
- Sections use `aria-labelledby` referencing their `h2` id.
- `:focus-visible` is styled with the accent.
- Motion respects `prefers-reduced-motion`.
