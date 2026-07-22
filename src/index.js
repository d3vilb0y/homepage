/**
 * Secret-code contact gate.
 *
 * The site is served as static assets (see [assets] in wrangler.toml). This
 * Worker runs first ONLY for the `/unlock` path (run_worker_first in
 * wrangler.toml); every other request is served directly from ./public with no
 * Worker overhead.
 *
 * When `/unlock?c=<code>` is hit with the correct code, the Worker pulls the
 * normal index.html from the ASSETS binding and injects a contact section
 * (email + phone) before returning it. The code, email, and phone all live in
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

  const block = `
    <section id="contact" class="block" aria-labelledby="contact-heading">
      <h2 id="contact-heading">
        <span class="num">04</span>
        Contact
        <span class="path" aria-hidden="true">~/contact</span>
      </h2>
      <p class="prose">
        You tapped the tag. Here's how to reach me directly.
      </p>
      <dl class="stack">
        <dt>Email</dt>
        <dd><a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a></dd>
        <dt>Phone</dt>
        <dd><a href="tel:${escapeAttr(telHref)}">${escapeHtml(phone)}</a></dd>
      </dl>
    </section>
  `;

  const injected = html.replace("</main>", `${block}\n  </main>`);

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
