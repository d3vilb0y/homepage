# Homepage

A simple static onepager served by a [Cloudflare Worker](https://developers.cloudflare.com/workers/) using
[static assets](https://developers.cloudflare.com/workers/static-assets/).

## Layout

- `public/` — static files served by the Worker
  - `index.html`
  - `styles.css`
- `wrangler.toml` — Worker config (binds `./public` as static assets)
- `package.json` — `dev` and `deploy` scripts via Wrangler v4

There is no Worker script — Cloudflare's Static Assets feature serves the
files in `public/` directly.

## Local preview

```sh
npm install
npm run dev
```

Wrangler starts a local server (default <http://localhost:8787>) that mirrors
the production runtime.

## Deploy

```sh
npm install
npx wrangler login
npm run deploy
```

The first deploy creates a Worker named `homepage` and uploads the contents of
`public/`. The site goes live at `https://homepage.<your-subdomain>.workers.dev`.

### CI / Git deploys

If you've connected this repo to a Cloudflare **Workers** project (Workers
Builds), the build system runs `wrangler deploy` on every push — `wrangler.toml`
takes care of the rest. Leave the build command empty.
