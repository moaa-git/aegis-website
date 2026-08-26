/**
 * Loader and parser for the legal documents in content/legal/.
 *
 * Those files are produced by scripts/legal-convert.mjs from Termly's HTML
 * export, so their markdown uses a known, closed subset: frontmatter, ATX
 * headings carrying an explicit `{#anchor}` id, paragraphs, bullet and
 * ordered lists, GFM tables, and inline links / bold / italic. A parser for
 * exactly that subset is ~150 lines and keeps the project on its existing
 * dependency set; a general-purpose markdown pipeline would be four packages
 * for the same two pages.
 *
 * The converter escapes every markdown-significant character it emits as
 * literal text, so "\*" here always means a literal asterisk and never an
 * emphasis marker that failed to parse.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Inline =
  | { type: "text"; value: string }
  | { type: "break" }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: number; id?: string; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: ListItem[] }
  | { type: "table"; head: Inline[][]; rows: Inline[][][] };

export type ListItem = { children: Inline[]; sublist?: ListItem[] };

export type LegalDoc = {
  slug: string;
  title: string;
  /** ISO date from the frontmatter; must match the document's own line. */
  lastUpdated: string;
  blocks: Block[];
};

// ------------------------------------------------------------------ inline

/** Length of the run of `*` starting at i. */
const starRun = (src: string, i: number) => {
  let n = 0;
  while (src[i + n] === "*") n++;
  return n;
};

/**
 * Index of the next run of at least `n` asterisks at or after `from`,
 * skipping escaped characters. -1 when there is none.
 */
const findCloser = (src: string, from: number, n: number) => {
  for (let i = from; i < src.length; i++) {
    if (src[i] === "\\") {
      i++;
      continue;
    }
    if (src[i] === "*" && starRun(src, i) >= n) return i;
  }
  return -1;
};

/** A `[text](href)` starting at `i`, or null. */
const matchLink = (src: string, i: number) => {
  let depth = 0;
  let close = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "\\") {
      j++;
      continue;
    }
    if (src[j] === "[") depth++;
    else if (src[j] === "]") {
      depth--;
      if (depth === 0) {
        close = j;
        break;
      }
    }
  }
  if (close === -1 || src[close + 1] !== "(") return null;
  const end = src.indexOf(")", close + 2);
  if (end === -1) return null;
  return {
    text: src.slice(i + 1, close),
    href: src.slice(close + 2, end),
    end: end + 1,
  };
};

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ type: "text", value: buf });
    buf = "";
  };

  let i = 0;
  while (i < src.length) {
    const c = src[i];

    if (c === "\\" && i + 1 < src.length) {
      buf += src[i + 1];
      i += 2;
      continue;
    }
    // A hard break inside a paragraph -- the source document's <br>.
    if (c === "\n") {
      flush();
      out.push({ type: "break" });
      i++;
      continue;
    }
    if (c === "[") {
      const link = matchLink(src, i);
      if (link) {
        flush();
        out.push({
          type: "link",
          href: link.href,
          children: parseInline(link.text),
        });
        i = link.end;
        continue;
      }
    }
    if (c === "*") {
      // Runs are matched by length, so ***both*** resolves to bold italic
      // rather than a stray asterisk plus a mis-paired **.
      const n = Math.min(starRun(src, i), 3);
      const close = findCloser(src, i + n, n);
      if (close !== -1 && close > i + n) {
        const inner = parseInline(src.slice(i + n, close));
        const node: Inline =
          n === 1
            ? { type: "em", children: inner }
            : n === 2
              ? { type: "strong", children: inner }
              : { type: "strong", children: [{ type: "em", children: inner }] };
        flush();
        out.push(node);
        i = close + n;
        continue;
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

// ------------------------------------------------------------------- blocks

const splitRow = (line: string) =>
  line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    // A literal pipe inside a cell is escaped by the converter.
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

const isDivider = (line: string) => /^\s*\|(\s*:?-{2,}:?\s*\|)+\s*$/.test(line);

const listMarker = (line: string) =>
  line.match(/^(\s*)(-|\d+\.)\s+([\s\S]*)$/);

function parseList(lines: string[]): Block {
  const ordered = /^\s*\d+\./.test(lines[0]);
  const items: ListItem[] = [];
  for (const line of lines) {
    const m = listMarker(line);
    if (!m) continue;
    const item: ListItem = { children: parseInline(m[3]) };
    if (m[1].length >= 2 && items.length) {
      const parent = items[items.length - 1];
      (parent.sublist ??= []).push(item);
    } else {
      items.push(item);
    }
  }
  return { type: "list", ordered, items };
}

export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];

  // Leading blank lines are part of the frontmatter delimiter, not content:
  // left in place they turn the document's own "# TITLE" into a chunk whose
  // first line is empty, which parses as a paragraph of literal markdown.
  for (const chunk of body.replace(/^\s*\n/, "").split(/\n{2,}/)) {
    const raw = chunk.replace(/\s+$/, "");
    if (!raw.trim()) continue;
    const lines = raw.split("\n");

    const heading = lines[0].match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const idMatch = heading[2].match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
      blocks.push({
        type: "heading",
        level: heading[1].length,
        id: idMatch?.[2],
        children: parseInline((idMatch?.[1] ?? heading[2]).trim()),
      });
      continue;
    }

    if (lines[0].startsWith("|") && lines.length > 1 && isDivider(lines[1])) {
      blocks.push({
        type: "table",
        head: splitRow(lines[0]).map(parseInline),
        rows: lines.slice(2).map((l) => splitRow(l).map(parseInline)),
      });
      continue;
    }

    if (listMarker(lines[0])) {
      blocks.push(parseList(lines));
      continue;
    }

    blocks.push({ type: "paragraph", children: parseInline(raw) });
  }

  return blocks;
}

// ------------------------------------------------------------------ loading

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export async function loadLegalDoc(slug: "privacy" | "terms"): Promise<LegalDoc> {
  const file = path.join(process.cwd(), "content", "legal", `${slug}.md`);
  const source = await readFile(file, "utf8");

  const fm = source.match(FRONTMATTER);
  if (!fm) throw new Error(`content/legal/${slug}.md has no frontmatter`);
  const meta: Record<string, string> = {};
  for (const line of fm[1].split("\n")) {
    const m = line.match(/^([\w]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  if (!meta.title || !meta.lastUpdated) {
    throw new Error(`content/legal/${slug}.md needs title and lastUpdated`);
  }

  return {
    slug,
    title: meta.title,
    lastUpdated: meta.lastUpdated,
    blocks: parseBlocks(source.slice(fm[0].length)),
  };
}

/** "2026-08-25" -> "August 25, 2026", matching the document's own wording. */
export function formatLastUpdated(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
