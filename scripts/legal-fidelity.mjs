#!/usr/bin/env node
/**
 * Content-fidelity check for the converted legal documents.
 *
 *   node scripts/legal-fidelity.mjs
 *
 * scripts/legal-convert.mjs discards markup, so the thing worth proving is
 * that it discarded *only* markup. This loads each Termly export in Chromium,
 * takes the text a reader would see, strips the markdown syntax back off
 * content/legal/*.md, and compares the two word sequences. Anything short of
 * "IDENTICAL word sequence" means content moved or was lost, and the first
 * divergence is printed with the words around it.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const PAIRS = [
  ["docs/legal-source/privacy-policy.html", "content/legal/privacy.md"],
  ["docs/legal-source/terms-of-service.html", "content/legal/terms.md"],
];

const norm = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

const browser = await chromium.launch();
const page = await browser.newPage();
let mismatches = 0;

for (const [src, md] of PAIRS) {
  await page.setContent(await readFile(src, "utf8"), {
    waitUntil: "domcontentloaded",
  });
  const srcText = norm(
    await page.evaluate(() => {
      // The <style> blocks and the hidden embed-detection div are the two
      // things the conversion drops that carry no visible text.
      document
        .querySelectorAll("style, div[style*='display: none']")
        .forEach((el) => el.remove());
      return document.body.innerText;
    })
  );

  const mdText = norm(
    (await readFile(md, "utf8"))
      .replace(/^---[\s\S]*?---\n/, "")
      .replace(/\{#[\w-]+\}/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\|\s*-{3}.*$/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/\|/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/(?<!\\)\*/g, "")
      .replace(/\\([\\*_`[\]|#>+.-])/g, "$1")
  );

  const a = srcText.split(" ");
  const b = mdText.split(" ");
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;

  console.log(`\n  ${md}   source ${a.length} words / markdown ${b.length} words`);
  if (i === a.length && i === b.length) {
    console.log("    IDENTICAL word sequence");
  } else {
    mismatches++;
    console.log(`    DIVERGES at word ${i}`);
    console.log(`      source  : ...${a.slice(Math.max(0, i - 12), i + 14).join(" ")}`);
    console.log(`      markdown: ...${b.slice(Math.max(0, i - 12), i + 14).join(" ")}`);
  }
}

await browser.close();
console.log(`\n  ${mismatches} document(s) diverge\n`);
process.exit(mismatches ? 1 : 0);
