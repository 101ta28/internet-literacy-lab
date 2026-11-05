import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      // BudouX's nested ESM package hides its browser mapping from Vite.
      // Use its browser adapter to keep the server-only DOM out of the bundle.
      name: "budoux-browser-dom",
      enforce: "pre",
      resolveId(source, importer, options) {
        if (
          !options.ssr &&
          source === "./dom.js" &&
          importer?.endsWith("/budoux/module/html_processor.js")
        ) {
          return importer.replace(/html_processor\.js$/, "dom-browser.js");
        }
      },
    },
  ],
  test: { include: ["src/**/*.test.ts"] },
});
