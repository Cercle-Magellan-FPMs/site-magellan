import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://magellan.fpms.ac.be",
  // Preserve the pre-v7 whitespace between inline elements.
  compressHTML: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: "never" },
});
