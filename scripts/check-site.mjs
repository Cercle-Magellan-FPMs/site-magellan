import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const origin = process.argv[2] ?? "http://127.0.0.1:8080";
const assets = new Set();
for (const [path, status] of [
  ["/", 200],
  ["/admins/", 200],
  ["/anciens-comit%C3%A9s/", 200],
  ["/missing-page", 404],
  ["/_astro/missing.js", 404],
]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get("cache-control"), "no-cache", path);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.equal(
    response.headers.get("permissions-policy"),
    "camera=(), microphone=(), geolocation=()",
  );
  assert.equal(response.headers.get("strict-transport-security"), null);
  assert.equal(response.headers.get("server"), "nginx");
  const csp = response.headers.get("content-security-policy");
  assert(csp?.includes("frame-ancestors 'none'"));
  assert(csp.includes("default-src 'self'"));
  assert(!/unsafe-inline|unsafe-eval|https?:/.test(csp));
  const html = await response.text();
  assert.match(html, /lang="fr-BE"/);
  assert.match(html, /<meta charset="utf-8"/);
  assert(!/fonts\.(googleapis|gstatic)\.com/.test(html));
  assert(!/<[^>]+\s(?:style|on\w+)\s*=/i.test(html));
  for (const [, , content] of html.matchAll(
    /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,
  )) {
    if (content.trim())
      assert(
        csp.includes(createHash("sha256").update(content).digest("base64")),
      );
  }
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/_astro\/[^" ]+)"/g))
    assets.add(asset);
  if (path === "/") {
    assert.match(html, /fetchpriority="high"/);
    assert.match(html, /sizes="100vw"/);
    for (const width of [640, 960, 1280, 1920])
      assert(html.includes(`${width}w`));
  }
}
for (const asset of assets) {
  const response = await fetch(new URL(asset, origin));
  assert.equal(response.status, 200, asset);
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert(response.headers.get("content-security-policy"));
  const body = await response.text();
  if (asset.endsWith(".css")) {
    assert.equal(response.headers.get("content-encoding"), "gzip");
    assert(response.headers.get("vary")?.includes("Accept-Encoding"));
    assert(!/fonts\.(googleapis|gstatic)\.com/.test(body));
  }
}
for (const path of [
  "/fonts/poppins-regular.woff2",
  "/robots.txt",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
  "/favicon.svg",
]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  await response.arrayBuffer();
  if (path.endsWith("woff2"))
    assert.equal(response.headers.get("content-type"), "font/woff2");
}
const redirect = await fetch(new URL("/admins", origin), {
  redirect: "manual",
});
await redirect.arrayBuffer();
assert([200, 301].includes(redirect.status));
if (redirect.status === 301)
  assert.equal(redirect.headers.get("location"), "/admins/");
console.log(
  `OK: pages, 404, CSP hashes, headers, cache, gzip, fonts, sitemap; ${assets.size} assets`,
);
