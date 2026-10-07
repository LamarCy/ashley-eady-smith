// Generates the favicon (a crop of the signature's big loop) and the Open Graph
// image (signature over the sky). Run with `npm run brand` after changing either source.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { toPath } from './centerline.mjs';

const d = readFileSync('public/brand/signature.svg', 'utf8').match(/ d="([^"]+)"/)[1];

// Favicon: a simplified big loop of "Eady", redrawn as one pen stroke on a paper disc.
const loop = toPath([[1150,520],[1060,640],[960,620],[925,520],[975,400],[1040,270],[1110,150],[1200,70],[1270,60],[1300,130],[1270,240],[1200,400],[1150,520],[1120,600]]);
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="31" fill="#f4f2ed" stroke="#d6d3cc"/>
<g transform="translate(32 33) scale(.072) translate(-1112 -350)"><path d="${loop}" fill="none" stroke="#111110" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>\n`;
writeFileSync('public/favicon.svg', fav);
await sharp(Buffer.from(fav)).resize(180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(fav)).resize(32).png().toFile('public/favicon-32.png');

// OG image: 1200x630, sky cover, Naples wash into paper, signature in ink.
const W = 1200, H = 630;
const sky = await sharp('src/assets/sky.jpg').resize(W, H, { fit: 'cover', position: 'centre' }).modulate({ brightness: 1.06 }).toBuffer();
const over = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f4f2ed" stop-opacity=".18"/><stop offset=".45" stop-color="#fbe6a0" stop-opacity=".55"/><stop offset="1" stop-color="#f4f2ed" stop-opacity=".96"/></linearGradient>
<radialGradient id="r" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#f4f2ed" stop-opacity=".85"/><stop offset="1" stop-color="#f4f2ed" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/><ellipse cx="600" cy="330" rx="560" ry="240" fill="url(#r)"/>
<svg x="170" y="130" width="860" height="392" viewBox="0 0 1876 855"><path fill="#111110" fill-rule="evenodd" d="${d}"/></svg>
<text x="600" y="580" text-anchor="middle" font-family="Menlo, monospace" font-size="20" letter-spacing="4" fill="#00726d">GUIDANCE · INSPIRATION · COURAGE · LIGHT</text>
</svg>`;
await sharp(sky).composite([{ input: Buffer.from(over) }]).jpeg({ quality: 86 }).toFile('public/og.jpg');
console.log('brand assets written');
