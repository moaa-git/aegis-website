#!/usr/bin/env node
/**
 * Derives the raster app icons from src/app/icon.svg.
 *
 *   node scripts/build-icons.mjs
 *
 * Next's app-icon file conventions want three files in src/app/:
 *
 *   icon.svg        the vector, served to anything that understands SVG
 *   favicon.ico     the legacy multi-size fallback (bookmarks, older Safari,
 *                   Windows shortcuts, feed readers)
 *   apple-icon.png  180x180, iOS home screen
 *
 * Only the first is hand-maintained; the other two are generated here so the
 * three never drift apart. Re-run after any change to icon.svg.
 *
 * There is no ImageMagick on this box and sharp cannot write .ico, so the
 * container is assembled by hand below. That is a small amount of code for a
 * simple format, and it is the same layout the file it replaces used: BMP
 * (BITMAPINFOHEADER) payloads at 16/32/48 for maximum compatibility, and a
 * PNG payload at 256 where every consumer that reads a 256px entry supports
 * PNG-in-ICO anyway.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const SRC = "src/app/icon.svg";
const ICO_SIZES = [16, 32, 48, 256];
/** Rendered from the vector at this DPI before downsampling, so the small
 *  entries are area-averaged from a clean raster rather than rasterised
 *  directly at 16px, where the shield's strokes fall between pixels. */
const DENSITY = 1200;

const svg = await readFile(SRC);

const renderRGBA = async (size) =>
  sharp(svg, { density: DENSITY })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer();

/**
 * One ICO image payload as a BMP: BITMAPINFOHEADER, then bottom-up BGRA
 * rows, then the 1bpp AND mask. The mask is left all-zero (fully opaque) --
 * with a 32bpp image the alpha channel is what consumers actually read, and
 * a zeroed mask is what every encoder emits.
 */
function bmpPayload(rgba, size) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(size, 4); // biWidth
  header.writeInt32LE(size * 2, 8); // biHeight: XOR + AND stacked
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression = BI_RGB

  const xor = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    // BMP rows run bottom-to-top.
    const src = (size - 1 - y) * size * 4;
    const dst = y * size * 4;
    for (let x = 0; x < size; x++) {
      xor[dst + x * 4 + 0] = rgba[src + x * 4 + 2]; // B
      xor[dst + x * 4 + 1] = rgba[src + x * 4 + 1]; // G
      xor[dst + x * 4 + 2] = rgba[src + x * 4 + 0]; // R
      xor[dst + x * 4 + 3] = rgba[src + x * 4 + 3]; // A
    }
  }

  // AND mask: 1 bit per pixel, each row padded to a 4-byte boundary.
  const maskRow = Math.ceil(size / 32) * 4;
  const and = Buffer.alloc(maskRow * size);

  header.writeUInt32LE(xor.length + and.length, 20); // biSizeImage
  return Buffer.concat([header, xor, and]);
}

const entries = [];
for (const size of ICO_SIZES) {
  const data =
    size === 256
      ? await sharp(svg, { density: DENSITY })
          .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 9 })
          .toBuffer()
      : bmpPayload(await renderRGBA(size), size);
  entries.push({ size, data });
}

const dir = Buffer.alloc(6 + entries.length * 16);
dir.writeUInt16LE(0, 0); // reserved
dir.writeUInt16LE(1, 2); // type: icon
dir.writeUInt16LE(entries.length, 4);

let offset = dir.length;
entries.forEach((entry, i) => {
  const o = 6 + i * 16;
  dir[o] = entry.size === 256 ? 0 : entry.size; // 0 encodes 256
  dir[o + 1] = entry.size === 256 ? 0 : entry.size;
  dir[o + 2] = 0; // palette colours
  dir[o + 3] = 0; // reserved
  dir.writeUInt16LE(1, o + 4); // colour planes
  dir.writeUInt16LE(32, o + 6); // bits per pixel
  dir.writeUInt32LE(entry.data.length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += entry.data.length;
});

const ico = Buffer.concat([dir, ...entries.map((e) => e.data)]);
await writeFile("src/app/favicon.ico", ico);

/**
 * apple-icon is flattened onto white. iOS composites a home-screen icon onto
 * black, and this mark's shield is #112431 -- on black it all but disappears.
 * White is the background the artwork was drawn against. The 12% inset keeps
 * the shield clear of the rounded-rect mask iOS applies.
 */
const APPLE = 180;
const inset = Math.round(APPLE * 0.12);
const appleMark = await sharp(svg, { density: DENSITY })
  .resize(APPLE - inset * 2, APPLE - inset * 2, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
await sharp({
  create: {
    width: APPLE,
    height: APPLE,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: appleMark, top: inset, left: inset }])
  .png({ compressionLevel: 9 })
  .toFile("src/app/apple-icon.png");

const kb = (n) => `${(n / 1024).toFixed(1)}kB`;
console.log(`\n  src/app/favicon.ico    ${kb(ico.length)}  ${entries.map((e) => `${e.size}px ${kb(e.data.length)}`).join("  ")}`);
console.log(`  src/app/apple-icon.png ${kb((await readFile("src/app/apple-icon.png")).length)}  ${APPLE}x${APPLE} on white, ${inset}px inset`);
console.log(`  src/app/icon.svg       ${kb(svg.length)}  (source, hand-maintained)\n`);
