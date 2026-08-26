#!/usr/bin/env node
/**
 * Termly HTML -> clean markdown, for content/legal/*.md.
 *
 *   node scripts/legal-convert.mjs [--check]
 *
 * The export in docs/legal-source/ is Word-flavoured HTML wrapped in Termly's
 * conditional <bdt> markup: ~300 <div>s standing in for paragraphs, ~670 <bdt>
 * elements (nearly all empty in the rendered output), inline styles on
 * everything, and at least one unclosed <h3>. Parsing that with regexes is not
 * viable, so the source is loaded into Chromium -- the same error recovery a
 * browser applies when it renders the published document -- and the *DOM* is
 * walked. What the reader sees is what gets converted.
 *
 * Content is Termly's and is copied verbatim; only markup is discarded. The
 * two deliberate edits are listed in FIXUPS below and in docs/DEVIATIONS.md.
 *
 * --check re-converts and diffs against the committed markdown instead of
 * writing, which is what a re-sync from a fresh Termly export should run.
 */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const CHECK = process.argv.includes("--check");

const DOCS = [
  {
    src: "docs/legal-source/privacy-policy.html",
    out: "content/legal/privacy.md",
    title: "Privacy Policy",
  },
  {
    src: "docs/legal-source/terms-of-service.html",
    out: "content/legal/terms.md",
    title: "Terms of Service",
  },
];

/**
 * Link rewrites applied during conversion. Both are corrections to what
 * Termly emits, not edits to the document's text.
 */
const FIXUPS = [
  // Termly writes the American Arbitration Association over plain HTTP.
  { from: "http://www.adr.org", to: "https://www.adr.org" },
  // Self-references must resolve in dev and on preview deploys, not bounce
  // through the production domain.
  { from: /^https:\/\/aegisascent\.com(\/.+)$/, to: (m) => m[1] },
];

const applyFixups = (href) => {
  for (const f of FIXUPS) {
    if (typeof f.from === "string") {
      if (href === f.from) return f.to;
    } else {
      const m = href.match(f.from);
      if (m) return f.to(m);
    }
  }
  return href;
};

// ------------------------------------------------------------ in-page pass

/**
 * Runs in the browser. Cleans the DOM, then serialises it to markdown.
 * Returns { markdown, stats } -- the stats are what the report is built from.
 */
function convert() {
  const doc = document;
  const stats = { bdtUnwrapped: 0, emptyLinksDropped: 0, tablesMerged: 0 };

  // --- 1. strip Termly's scaffolding -------------------------------------

  // <style> blocks top and bottom.
  doc.querySelectorAll("style").forEach((el) => el.remove());

  // The embed-detection element: a display:none div holding a bare link with
  // class privacy123/terms123. Nothing renders from it.
  doc
    .querySelectorAll("div[style*='display: none'], a.privacy123, a.terms123")
    .forEach((el) => (el.closest("div[style*='display: none']") || el).remove());

  // The Termly badge, when the export carries one (this pair does not).
  doc
    .querySelectorAll("span[style*='base64'], [class*='termly-badge']")
    .forEach((el) => el.remove());

  // <bdt> is unwrapped, not deleted: most are empty, but `bdt.question` wraps
  // real content (the <h1>, the "Last updated" date, the contact address).
  const unwrap = (el) => {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  };
  for (;;) {
    const bdts = [...doc.querySelectorAll("bdt")];
    if (!bdts.length) break;
    bdts.forEach(unwrap);
    stats.bdtUnwrapped += bdts.length;
  }

  // Anchor targets referenced from inside the document. Only these ids are
  // carried onto headings -- Termly also emits duplicate id="control" spans
  // and UUID ids on conditional blocks, which nothing links to.
  const referenced = new Set(
    [...doc.querySelectorAll("a[href^='#']")].map((a) =>
      a.getAttribute("href").slice(1)
    )
  );

  // Empty anchors. Termly leaves an <a href="#products"></a> for every TOC
  // entry whose section was excluded from this document; they render as
  // nothing and their targets do not exist.
  doc.querySelectorAll("a").forEach((a) => {
    if (!a.textContent.trim()) {
      a.remove();
      stats.emptyLinksDropped++;
    }
  });

  // --- 2. heading ids ----------------------------------------------------
  // The id sits on the <div> (or <span>) wrapping the heading, not on the
  // heading itself, so each referenced id is resolved to the heading it
  // actually scrolls to.
  const headingIds = new Map();
  const allHeadings = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  for (const id of referenced) {
    const el = doc.getElementById(id);
    if (!el) continue;
    const inside = el.matches("h1,h2,h3,h4,h5,h6")
      ? el
      : el.querySelector("h1,h2,h3,h4,h5,h6");
    const target =
      inside ||
      allHeadings.find(
        (h) => el.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING
      );
    if (target && !headingIds.has(target)) headingIds.set(target, id);
  }

  // --- 3. strip the polluting attributes ---------------------------------
  const DROP_ATTRS = [
    "style",
    "class",
    "data-custom-class",
    "data-type",
    "data-record-question-key",
    "data-id",
    "id",
    "name",
    "align",
    "rel",
    "target",
  ];
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of DROP_ATTRS) el.removeAttribute(a);
  });

  // --- 3b. lift blocks out of inline wrappers -----------------------------
  //
  // Termly's markup routinely opens a <span> around one sentence and closes
  // it thirty <div>s later, so a heading or an entire later section can sit
  // *inside* an inline wrapper. Walking that tree directly shatters a
  // sentence at the wrapper boundary -- the paragraph introducing the
  // category table lost its trailing link exactly this way. Every block
  // element is therefore hoisted out of its inline ancestors first, the
  // wrapper being split into the run before it and the run after, until no
  // inline element contains a block. After this pass the tree has clean
  // block/inline separation and can be serialised in one linear walk.

  const BLOCK_TAGS = new Set([
    "DIV", "P", "UL", "OL", "LI", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
    "H1", "H2", "H3", "H4", "H5", "H6",
  ]);
  const INLINE_SEL = "span,strong,em,b,i,u,a,font,small,sup,sub";

  const liftOnce = () => {
    let changed = false;
    for (const el of [...doc.querySelectorAll(INLINE_SEL)]) {
      if (!el.parentNode) continue;
      const kids = [...el.childNodes];
      if (!kids.some((k) => k.nodeType === 1 && BLOCK_TAGS.has(k.tagName))) continue;
      changed = true;
      const parent = el.parentNode;
      const out = [];
      let run = el.cloneNode(false);
      for (const k of kids) {
        if (k.nodeType === 1 && BLOCK_TAGS.has(k.tagName)) {
          if (run.childNodes.length) out.push(run);
          out.push(k);
          run = el.cloneNode(false);
        } else {
          run.appendChild(k);
        }
      }
      if (run.childNodes.length) out.push(run);
      for (const n of out) parent.insertBefore(n, el);
      parent.removeChild(el);
    }
    return changed;
  };
  // Each pass strictly reduces the number of inline-wraps-block pairs, so
  // this terminates; the cap is only there to make a pathological input
  // fail loudly rather than hang.
  for (let i = 0; liftOnce(); i++) {
    if (i > 200) throw new Error("block-lifting did not converge");
  }

  // --- 4. serialise ------------------------------------------------------

  const collapse = (s) => s.replace(/\s+/g, " ");

  /** Markdown-significant characters that must survive as literal text. */
  const escapeText = (s) => s.replace(/([\\*_`[\]|])/g, "\\$1");

  /**
   * A paragraph whose opening characters would otherwise be read as a
   * heading, list marker, or blockquote. Applied only where a paragraph
   * begins, so "13. HOW CAN YOU..." inside a sentence or a link stays clean.
   */
  const escapeBlockStart = (s) =>
    s
      .replace(/^([#>])/, "\\$1")
      .replace(/^([-+])(\s)/, "\\$1$2")
      .replace(/^(\d+)\.(\s)/, "$1\\.$2");

  /**
   * Emphasis markers cannot sit against whitespace and still parse, so any
   * padding inside the element is lifted outside the delimiters.
   */
  const wrap = (inner, mark) => {
    const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m || !m[2]) return inner;
    return `${m[1]}${mark}${m[2]}${mark}${m[3]}`;
  };

  /** Markdown for a single node, tag included. */
  const inlineNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeText(collapse(node.nodeValue));
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName;
    if (tag === "BR") return "\n";
    const inner = inline(node);
    if (tag === "STRONG" || tag === "B") return wrap(inner, "**");
    if (tag === "EM" || tag === "I") return wrap(inner, "*");
    if (tag === "A") {
      const href = node.getAttribute("href") || "";
      return inner.trim() ? `[${inner.trim()}](${href})` : "";
    }
    // SPAN, U, and anything else presentational: keep the text, drop the
    // tag. <u> is not in the keep-list and markdown has no underline; every
    // occurrence in these two documents already sits inside a <strong>.
    return inner;
  };

  /** Markdown for a node's children. */
  const inline = (node) => {
    let out = "";
    for (const child of node.childNodes) out += inlineNode(child);
    return out;
  };

  /**
   * Termly wraps headings and lists inside <strong><span> chains, so a
   * container is judged by its block *descendants*, not its direct children;
   * checking only children flattens every heading into bold body text.
   */
  const BLOCK_SEL = "div,p,ul,ol,table,h1,h2,h3,h4,h5,h6";
  const hasBlockDescendant = (el) => Boolean(el.querySelector(BLOCK_SEL));

  const blocks = [];
  /** Structured block (heading, list, table) -- emitted as written. */
  const push = (s) => {
    const t = s.replace(/[ \t]+$/gm, "").trim();
    if (t) blocks.push(t);
  };
  /** Prose block -- escaped so its opening characters stay literal. */
  const pushPara = (s) => {
    const t = s
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
    if (t) blocks.push(escapeBlockStart(t));
  };
  /**
   * Termly emits most bullets as their own single-item <ul>, so consecutive
   * lists are folded back into one rather than left as 56 one-item lists.
   */
  const pushList = (items, ordered) => {
    const prev = blocks[blocks.length - 1];
    const marker = ordered ? /^\d+\.\s/ : /^-\s/;
    if (prev && marker.test(prev)) {
      blocks[blocks.length - 1] = `${prev}\n${items.join("\n")}`;
      return;
    }
    push(items.join("\n"));
  };

  const tableRows = (table) =>
    [...table.rows].map((r) => [...r.cells].map((c) => inline(c).trim()));

  let pendingTable = null;
  const flushTable = () => {
    if (!pendingTable) return;
    const [head, ...body] = pendingTable;
    push(
      [
        `| ${head.join(" | ")} |`,
        `| ${head.map(() => "---").join(" | ")} |`,
        ...body.map((r) => `| ${r.join(" | ")} |`),
      ].join("\n")
    );
    pendingTable = null;
  };

  /**
   * Walks a container. Consecutive inline siblings are buffered into one
   * paragraph: Termly routinely puts a heading and the two paragraphs after
   * it inside a single <div>, and emitting each inline run as its own block
   * would shatter a sentence into four -- losing the link that straddles the
   * break in the process.
   */
  const walk = (node) => {
    let buf = "";
    const flushPara = () => {
      const t = buf;
      buf = "";
      if (t.trim()) {
        flushTable();
        pushPara(t);
      }
    };

    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        buf += escapeText(collapse(child.nodeValue));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName;

      if (/^H[1-6]$/.test(tag)) {
        flushPara();
        flushTable();
        const level = Number(tag[1]);
        const id = headingIds.get(child);
        // Termly leaves one <h3> unclosed, which the parser repairs by
        // pulling the wrapping <strong> inside it; a heading that is wholly
        // bold is already a heading, so the markers are dropped.
        let text = inline(child).trim();
        const bolded = text.match(/^\*\*([\s\S]+)\*\*$/);
        if (bolded && !bolded[1].includes("**")) text = bolded[1].trim();
        push(`${"#".repeat(level)} ${text}${id ? ` {#${id}}` : ""}`);
        continue;
      }

      if (tag === "UL" || tag === "OL") {
        flushPara();
        flushTable();
        const ordered = tag === "OL";
        const items = [...child.children]
          .filter((li) => li.tagName === "LI")
          .map((li, i) => {
            const nested = [...li.children].filter((c) =>
              ["UL", "OL"].includes(c.tagName)
            );
            nested.forEach((n) => n.remove());
            let text = `${ordered ? `${i + 1}.` : "-"} ${inline(li).trim()}`;
            for (const n of nested) {
              for (const sub of [...n.children]) {
                text += `\n  - ${inline(sub).trim()}`;
              }
            }
            return text;
          })
          .filter((t) => t.replace(/^(-|\d+\.)\s*/, "").trim());
        if (items.length) pushList(items, ordered);
        continue;
      }

      if (tag === "TABLE") {
        // Termly splits one logical table into consecutive <table>s wherever
        // a conditional block interrupts it. Fragments with a matching column
        // count and no repeated header are folded back into one table.
        flushPara();
        const rows = tableRows(child);
        if (!rows.length) continue;
        if (pendingTable && pendingTable[0].length === rows[0].length) {
          pendingTable.push(...(child.querySelector("thead th") ? rows.slice(1) : rows));
          stats.tablesMerged++;
        } else {
          flushTable();
          pendingTable = rows;
        }
        continue;
      }

      if (tag === "DIV" || tag === "P" || tag === "LI") {
        flushPara();
        if (hasBlockDescendant(child)) walk(child);
        else {
          const text = inline(child).trim();
          if (text) {
            flushTable();
            pushPara(text);
          }
        }
        continue;
      }

      // An inline element that nonetheless carries block content -- Termly
      // nests <h2> inside <strong><span> chains. Descend rather than
      // flatten it to bold text.
      if (hasBlockDescendant(child)) {
        flushPara();
        walk(child);
        continue;
      }

      buf += inlineNode(child);
    }

    flushPara();
  };
  walk(doc.body);
  flushTable();

  return { markdown: blocks.join("\n\n") + "\n", stats };
}

// ----------------------------------------------------------------- driver

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const doc of DOCS) {
  const html = await readFile(doc.src, "utf8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const { markdown, stats } = await page.evaluate(convert);

  // The "Last updated" line is the document's own; the frontmatter date has
  // to match it or a re-sync silently ships a stale date.
  const dateLine = markdown.match(/^\**Last updated\**\s+\**(.+?)\**$/m);
  if (!dateLine) throw new Error(`${doc.src}: no "Last updated" line found`);
  const iso = new Date(dateLine[1].replace(/\\/g, "")).toISOString().slice(0, 10);

  // Link fixups, applied to the markdown so the rewrite is visible in a diff.
  let body = markdown.replace(/\]\(([^)]+)\)/g, (m, href) => {
    const fixed = applyFixups(href);
    return `](${fixed})`;
  });

  const front = `---\ntitle: ${doc.title}\nlastUpdated: ${iso}\n---\n\n`;
  const next = front + body;

  const prev = existsSync(doc.out) ? await readFile(doc.out, "utf8") : null;
  if (CHECK) {
    results.push({ ...doc, stats, iso, changed: prev !== next, wrote: false });
  } else {
    await writeFile(doc.out, next);
    results.push({ ...doc, stats, iso, changed: prev !== next, wrote: true });
  }
}

await browser.close();

for (const r of results) {
  console.log(
    `  ${r.out.padEnd(26)} lastUpdated ${r.iso}  ` +
      `bdt ${String(r.stats.bdtUnwrapped).padStart(4)}  ` +
      `empty-links ${String(r.stats.emptyLinksDropped).padStart(3)}  ` +
      `tables-merged ${r.stats.tablesMerged}  ` +
      `${CHECK ? (r.changed ? "DIFFERS" : "up to date") : r.changed ? "written (changed)" : "written (no change)"}`
  );
}
if (CHECK && results.some((r) => r.changed)) process.exit(1);
