import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { toPath, STROKE, POINTS } from './centerline.mjs';
const out = process.argv[2] || 'centerline-overlay.png';
const ink = readFileSync('public/brand/signature.svg', 'utf8').match(/ d="([^"]+)"/)[1];
const W = 1876, H = 855;
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${body}</svg>`);
const raw = async (b) => (await sharp(b).greyscale().raw().toBuffer());
const a = await raw(svg(`<path fill="#fff" fill-rule="evenodd" d="${ink}"/>`));
const m = await raw(svg(`<path d="${toPath()}" fill="none" stroke="#fff" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`));
let total = 0, miss = 0; const cells = {};
for (let i = 0; i < a.length; i++) if (a[i] > 128) { total++; if (m[i] < 128) { miss++; const x = i % W, y = (i / W) | 0; const k = `${(x / 40) | 0},${(y / 40) | 0}`; cells[k] = (cells[k] || 0) + 1; } }
console.log(`points ${POINTS.length}  coverage ${(100 * (1 - miss / total)).toFixed(2)}%  missed px ${miss}`);
Object.entries(cells).filter(([, n]) => n > 15).sort((p, q) => q[1] - p[1]).slice(0, 40)
  .forEach(([k, n]) => { const [cx, cy] = k.split(',').map(Number); console.log(`  ~(${cx * 40 + 20},${cy * 40 + 20}) ${n}px`); });
const ov = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f4f2ed"/><path fill="#111110" fill-rule="evenodd" d="${ink}"/><path d="${toPath()}" fill="none" stroke="#00908a" stroke-opacity=".35" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/><path d="${toPath()}" fill="none" stroke="#f48067" stroke-width="3"/></svg>`);
await sharp(ov).resize(1400).png().toFile(out);
