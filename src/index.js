/**
 * Secret-code contact gate.
 *
 * The site is served as static assets (see [assets] in wrangler.toml). This
 * Worker runs first ONLY for the `/unlock` path (run_worker_first in
 * wrangler.toml); every other request is served directly from ./public with no
 * Worker overhead.
 *
 * When `/unlock?c=<code>` is hit with the correct code, the Worker pulls the
 * normal index.html from the ASSETS binding and injects a contact pop-up
 * (email + phone) over the page before returning it. The code, email, and phone all live in
 * Worker secrets — never in the repo and never in the public HTML — so the
 * contact details are absent from the site unless the correct code is given.
 *
 * Secrets (set with `wrangler secret put <NAME>`, or .dev.vars locally):
 *   SECRET_CODE    — the code written to the NFC tag
 *   CONTACT_EMAIL  — Arrow email to reveal
 *   CONTACT_PHONE  — phone number to reveal
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/unlock") {
      const code = url.searchParams.get("c") || "";
      if (await safeEqual(code, env.SECRET_CODE)) {
        return renderUnlocked(env, url);
      }
      // Wrong or missing code: don't confirm the path exists, just send home.
      return Response.redirect(new URL("/", url).toString(), 302);
    }

    // Not the gate — hand off to static assets. (Reached only if run_worker_first
    // ever routes something else here; normal asset paths bypass the Worker.)
    return env.ASSETS.fetch(request);
  },
};

async function renderUnlocked(env, url) {
  const res = await env.ASSETS.fetch(new URL("/", url));
  const html = await res.text();

  const email = env.CONTACT_EMAIL || "";
  const phone = env.CONTACT_PHONE || "";
  const telHref = phone.replace(/[^+\d]/g, "");

  // A pop-up shown over the normal page — dimmed backdrop + centered card.
  // No client-side JS: the backdrop and the × are links back to "/", which
  // dismisses the reveal by navigating to the clean (locked) page.
  const style = `
    <style id="reveal-style">
      .reveal { position: fixed; inset: 0; z-index: 1000; display: flex;
        align-items: center; justify-content: center; padding: var(--gutter); }
      .reveal__backdrop { position: absolute; inset: 0; display: block;
        background: rgba(0, 0, 0, 0.72); -webkit-backdrop-filter: blur(4px);
        backdrop-filter: blur(4px); }
      .reveal__card { position: relative; z-index: 1; width: 100%;
        max-width: 26rem; background: var(--surface);
        border: 1px solid var(--border-strong); padding: 2rem 1.75rem 2.25rem;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55); }
      .reveal__card .kicker { margin: 0 0 0.75rem; }
      .reveal__card h2 { font-size: 1.4rem; font-weight: 500;
        letter-spacing: -0.02em; margin: 0; color: var(--text); }
      .reveal__card .stack { margin-top: 1.5rem; }
      .reveal__close { position: absolute; top: 0.65rem; right: 0.85rem;
        font-family: var(--mono); font-size: 1.35rem; line-height: 1;
        color: var(--text-dim); text-decoration: none;
        transition: color 0.15s var(--ease); }
      .reveal__close:hover { color: var(--text); }
      @media (prefers-reduced-motion: no-preference) {
        .reveal__backdrop { animation: reveal-fade 0.28s ease both; }
        .reveal__card { animation: reveal-in 0.28s var(--ease) both; }
      }
      @keyframes reveal-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes reveal-in {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: none; }
      }
    </style>`;

  const popup = `
    <div class="reveal" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
      <a class="reveal__backdrop" href="/" aria-label="Close"></a>
      <div class="reveal__card">
        <a class="reveal__close" href="/" aria-label="Close">&times;</a>
        <p class="kicker"><span class="prompt" aria-hidden="true">~$</span> contact --reveal</p>
        <h2 id="reveal-title">Ted Nordvall</h2>
        <dl class="stack">
          <dt>Email</dt>
          <dd><a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a></dd>
          <dt>Phone</dt>
          <dd><a href="tel:${escapeAttr(telHref)}">${escapeHtml(phone)}</a></dd>
        </dl>
      </div>
    </div>`;

  const injected = html
    .replace("</head>", `${style}\n</head>`)
    .replace("</body>", `${popup}\n</body>`);

  return new Response(injected, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      "referrer-policy": "no-referrer",
    },
  });
}

/**
 * Constant-time string comparison. Hashing both sides first yields fixed-length
 * inputs, so the byte compare doesn't leak length or content via timing.
 */
async function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || b.length === 0) {
    return false;
  }
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}
