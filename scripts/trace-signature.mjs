// One-off: trace public/brand/signature.png into a single evenodd path (viewBox 0 0 1876 855).
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFileSync } from 'node:fs';
const buf = await sharp('public/brand/signature.png').flatten({ background: '#ffffff' }).grayscale().png().toBuffer();
potrace.trace(buf, { threshold: 140, turdSize: 4, optTolerance: 0.3 }, (err, svg) => {
  if (err) throw err;
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  writeFileSync('public/brand/signature.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1876 855"><path fill="#111110" fill-rule="evenodd" d="${d}"/></svg>\n`);
  console.log('path length', d.length);
});
