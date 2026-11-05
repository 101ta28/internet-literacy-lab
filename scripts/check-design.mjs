import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

// Run after the production build. Reuse the preview when the owner has it open.
const base = "http://127.0.0.1:4173";
const output = ".hallmark/render";
await mkdir(output, { recursive: true });
let server;
let browser;
const reachable = async () => {
  try {
    return (await fetch(base)).ok;
  } catch {
    return false;
  }
};
try {
  if (!(await reachable())) {
    server = spawn(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        "4173",
        "--strictPort",
      ],
      { stdio: "inherit" },
    );
    for (let i = 0; i < 50 && !(await reachable()); i++)
      await new Promise((resolve) => setTimeout(resolve, 100));
    if (!(await reachable()))
      throw new Error("Preview server could not start on 127.0.0.1:4173");
  }
  browser = await chromium.launch({ channel: "chrome" });
  const captures = [
    ["home", "/", [320, 390, 1280, 1440, 1920]],
    ["challenges", "/challenges", [390, 1440]],
    ["knowledge", "/knowledge", [390, 1440]],
    ["email", "/challenges/suspicious-email", [390, 1440]],
    ["photo", "/challenges/photo-privacy", [390, 1440]],
    ["news", "/challenges/before-sharing", [320, 390, 1440]],
    ["shop", "/challenges/too-good-to-buy", [320, 390, 1440]],
    ["support", "/challenges/sudden-warning", [320, 390, 1440]],
    ["news-article", "/knowledge/checking-information", [320, 390, 1440]],
    ["shop-article", "/knowledge/shopping-checks", [320, 390, 1440]],
    ["support-article", "/knowledge/support-scam", [320, 390, 1440]],
    ["article", "/knowledge/phishing", [390, 1440]],
    ["progress", "/progress", [390, 1440]],
  ];
  const report = [];
  for (const [name, route, widths] of captures)
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: {
          width,
          height: width === 1280 ? 800 : width >= 1440 ? 900 : 844,
        },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/#${route}`);
      await page.locator("h1").waitFor();
      await page.screenshot({
        path: `${output}/${name}-${width}.png`,
        fullPage: true,
      });
      if (name === "home")
        await page.screenshot({ path: `${output}/hero-${width}.png` });
      const layout = await page.evaluate(() => {
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            bottom: r.bottom,
          };
        };
        const overflow = [...document.querySelectorAll("main *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return (
              s.display !== "none" &&
              r.width > 0 &&
              (r.right > innerWidth + 1 || r.left < -1)
            );
          })
          .map((el) => ({
            tag: el.tagName,
            class: el.className.baseVal ?? el.className,
            ...rect(el),
          }));
        return {
          pageWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
          overflow,
          h1: rect(document.querySelector("h1")),
          action: document.querySelector(".hero-actions .primary")
            ? rect(document.querySelector(".hero-actions .primary"))
            : null,
        };
      });
      report.push({ name, route, width, errors, ...layout });
      console.log(
        `${name} ${width}px: ${layout.overflow.length} overflowing elements, ${errors.length} JS errors`,
      );
      await page.close();
    }
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      { capturedAt: new Date().toISOString(), captures: report },
      null,
      2,
    ),
  );
  if (
    report.some(
      (r) =>
        r.errors.length || r.overflow.length || r.pageWidth > r.viewport + 1,
    )
  )
    process.exitCode = 1;
} finally {
  await browser?.close();
  server?.kill();
}
