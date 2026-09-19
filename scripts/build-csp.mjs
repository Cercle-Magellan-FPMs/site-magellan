import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { glob, mkdir, readFile, writeFile } from "node:fs/promises";

// ClientRouter swaps pages under the initial document's policy. Allow the
// union of build-generated hashes so every entry page can navigate safely.
const hashes = { script: new Set(), style: new Set() };
let pages = 0;
for await (const file of glob("dist/**/*.html")) {
  const html = await readFile(file, "utf8");
  for (const [, tag, content] of html.matchAll(
    /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,
  )) {
    if (content.trim()) {
      hashes[tag.toLowerCase()].add(
        `'sha256-${createHash("sha256").update(content).digest("base64")}'`,
      );
    }
  }
  pages++;
}
assert(pages > 0, "Build the site before generating its CSP");
const policy = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  `style-src 'self' ${[...hashes.style].sort().join(" ")}`.trim(),
  `script-src 'self' ${[...hashes.script].sort().join(" ")}`.trim(),
  "style-src-attr 'none'",
  "script-src-attr 'none'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");
await mkdir(".nginx", { recursive: true });
await writeFile(
  ".nginx/csp.conf",
  `add_header Content-Security-Policy "${policy}" always;\n`,
);
console.log(
  `CSP: ${pages} pages, ${hashes.script.size} script hashes, ${hashes.style.size} style hashes`,
);
