# Homepage

A simple static onepager deployable to [Cloudflare Pages](https://pages.cloudflare.com/).

## Files

- `index.html` — the page
- `styles.css` — styling
- `wrangler.toml` — Cloudflare Pages config
- `package.json` — `dev` and `deploy` scripts via Wrangler

## Local preview

You can open `index.html` directly in a browser, or run a local Cloudflare-like
dev server:

```sh
npm install
npm run dev
```

## Deploy to Cloudflare

1. Install dependencies and authenticate with Cloudflare:

   ```sh
   npm install
   npx wrangler login
   ```

2. Deploy:

   ```sh
   npm run deploy
   ```

   Wrangler will create the Pages project on first run and upload the static
   files. The site will be live at `https://homepage.pages.dev` (or your
   chosen project name).

### Alternative: Git integration

You can also connect this repository to Cloudflare Pages via the dashboard:

- **Build command:** *(leave empty)*
- **Output directory:** `/`

Every push to the configured branch will trigger a deploy.
