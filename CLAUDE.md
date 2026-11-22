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
- `public/brand/` — the NSALABB brand kit (`nsalabb.css` with the `--nl-*` tokens incl. `--nl-logo-*` and `--nl-font-wordmark`, `tokens.json`, `mark.svg`, `mark-paper.svg`, `app-icon.svg`, `README.md`, and `logo/` with Ted's "Prompt" logo files as delivered), copied verbatim from `brand/` in d3vilb0y/servicerr, where `src/shared/brand.ts` is the source of truth. Don't edit these files here; to update, copy the folder again from servicerr. `<head>` uses `/favicon.ico` (a byte copy of `brand/logo/favicon.ico`), `brand/logo/svg/favicon.svg` and `brand/logo/png/apple-touch-icon.png`.
- `public/styles.css` — the page's design system on top of the kit. Its `:root` tokens only alias `--nl-*`: surfaces (`--bg`, `--surface`, `--border`, `--border-strong`), text (`--text`, `--text-dim`, `--text-faint`), `--accent` (red for small text, `--nl-accent-text`), `--accent-fill` (full red `--nl-accent`), `--support` (army green), type (`--sans`, `--mono`), layout (`--content-width`, `--gutter`, `--radius`), and `--ease`. Never add new hex colours. Fonts (IBM Plex Sans + IBM Plex Mono, plus JetBrains Mono 500 for the logo wordmark) load from Google Fonts via `<link>` in the HTML.
- `public/starfield.js` — the NSALABB starfield, a vanilla port of servicerr's `src/shared/starfield.ts` + `src/web/Starfield.tsx`. It adds a fixed `canvas.starfield` behind the page; static under `prefers-reduced-motion`, paused in hidden tabs.

The starfield is the **only client-side JavaScript**, and it's decorative: with JS off the page is identical minus the stars. Don't add other client JS. The server-side Worker gate is the only other script.

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

The page wears the NSALABB brand (direction "Rack", shared by every nsalabb.se service): matte black ground with a quiet starfield, slate surfaces, off-white ink, one F5 red accent, army green for what's running, IBM Plex type. Within that it stays restrained — type-driven hierarchy, hairline rules instead of card surfaces. When making changes, preserve these rules:

- **Logo lockup.** The header brand is the shared NSALABB lockup: the `n_` tile (on `--nl-logo-panel`), then `nsalabb_ | ~/bio` in JetBrains Mono 500 (`--nl-font-wordmark`), with the `_` and `~/` in the logo amber, a `--nl-logo-divider` rule and "bio" in `--nl-logo-path`. On small screens (≤560px) only the tile shows. The amber belongs to the logo only; never use it elsewhere on the page.
- **One accent, F5 red.** `--accent` (`#ff3b55`, the red for text on dark) is used only for `<em>` inside the h1, the `~$` prompt, hovered work-row numbers, link hovers and `:focus-visible` rings. `--accent-fill` (`#e4002b`) is for the `.now` left border and `::selection`. Don't reintroduce gradient text, gradient buttons, or multi-accent palettes.
- **Army green supports it.** `--support` is for the `.now` key with its dot (the current role is "running"). Nothing else.
- **Mono (IBM Plex Mono) is for technical bits only** — kicker, nav, section number (`.num`), section path (`.path`), `.now` line, stack `<dt>`, work `.tags`, footer. Body copy is IBM Plex Sans.
- **Single column, ~720px content width** (`--content-width`). The sticky header, main, and footer all share `.row` as the centered container.
- **Hairlines, not boxes.** Sections separate with 1px `--border` rules under `h2`. Work entries are `<li>` rows with top borders, no cards. The only hover motion is `.work li` shifting 8px right (its leading number turns accent).
- **Terminal flavor, kept quiet.** The techie touches are: a `~$ whoami` kicker, the blinking amber cursor in the header lockup (the only CSS animation; respects reduced-motion), bracketed section indices (`[01]`) with a faint `~/section` path on the right, CSS-counter numbering on work rows, a `.now` status line for the current role, an `EOF` mark in the footer, and the NSALABB starfield behind everything (no constellation lines, scanlines, or glows).
- Section headings are `<h2>` with a small mono `.num` ("01", "02", "03") preceding the name. Anchors are `#about`, `#work`, `#interests`.
- The site owner is **Ted Nordvall** (handle **d3vilb0y**), a cybersecurity engineer in Jönköping, Sweden, currently Product Specialist — Cybersecurity at Arrow ECS. Tone is terse, professional, lowercase-friendly. Keep it that way unless asked otherwise.

## Accessibility

- Skip link (`.skip`) targets `#main`.
- Sections use `aria-labelledby` referencing their `h2` id.
- `:focus-visible` is styled with the accent.
- Motion respects `prefers-reduced-motion`.
