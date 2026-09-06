/**
 * One-time (re-runnable) image optimizer.
 *
 * Converts every raster image under src/assets/images/ that is imported by the
 * app into a resized WebP, then deletes the original. Import statements use
 * `.webp` after this runs. Safe to re-run: files already `.webp` are skipped.
 *
 *   node scripts/optimize-images.mjs
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = join(root, 'src/assets/images');

const MAX_EDGE = 1600; // carousel / hero display size, 2x for retina
const QUALITY = 80;
const RASTER = new Set(['.jpg', '.jpeg', '.png']);

const bytes = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

const files = await readdir(IMAGES_DIR);
let before = 0;
let after = 0;
let converted = 0;

for (const name of files) {
  const ext = extname(name).toLowerCase();
  if (!RASTER.has(ext)) continue; // leaves .svg, .webp, .heic, .ico alone

  const src = join(IMAGES_DIR, name);
  const out = join(IMAGES_DIR, name.slice(0, -extname(name).length) + '.webp');

  const { size: inSize } = await stat(src);
  before += inSize;

  try {
    await sharp(src)
      .rotate() // bake in EXIF orientation so nothing ends up sideways
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);

    const { size: outSize } = await stat(out);
    after += outSize;
    converted += 1;
    await unlink(src);
    console.log(`  ${name.padEnd(28)} ${bytes(inSize).padStart(10)} -> ${bytes(outSize).padStart(10)}`);
  } catch (err) {
    console.error(`  SKIP ${name}: ${err.message}`);
    after += inSize;
  }
}

console.log(
  `\n${converted} images  ${bytes(before)} -> ${bytes(after)}  ` +
    `(${(100 - (after / before) * 100).toFixed(1)}% smaller)`
);
