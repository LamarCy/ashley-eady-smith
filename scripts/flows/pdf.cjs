// Flow capture, step 3 of 3. Combines the boards into one PDF with a cover page.
// Usage: node scripts/flows/pdf.cjs <boardsDir> <tmpDir> <out.pdf>
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs'), path = require('path');
const [F, TMP, OUT] = process.argv.slice(2).map((p) => path.resolve(p));
const NM = require('path').resolve(__dirname, '../../node_modules/@fontsource');
const SIG = require('path').resolve(__dirname, '../../public/brand/signature.svg');
const SKY = require('path').resolve(__dirname, '../../src/assets/sky.jpg');
(async () => {
  const boards = fs.readdirSync(F).filter((f) => /^\d\d-.*-(mobile|desktop)\.png$/.test(f)).sort((a, b) => a.slice(0, 2).localeCompare(b.slice(0, 2)) || (a.includes('-mobile') ? -1 : 1));
  const imgs = [];
  for (const b of boards) { const o = path.join(TMP, b.replace('.png', '.jpg')); await sharp(path.join(F, b)).flatten({ background: '#f4f2ed' }).jpeg({ quality: 86, mozjpeg: true }).toFile(o); imgs.push(o); }
  const font = (f) => 'file://' + path.join(NM, f);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'EB Garamond';src:url(${font('eb-garamond/files/eb-garamond-latin-400-normal.woff2')})}
@font-face{font-family:'EB Garamond';src:url(${font('eb-garamond/files/eb-garamond-latin-400-italic.woff2')});font-style:italic}
@font-face{font-family:'DM Mono';src:url(${font('dm-mono/files/dm-mono-latin-400-normal.woff2')})}
@page{size:1920px 1080px;margin:0}
*{margin:0;box-sizing:border-box}
body{background:#f4f2ed}
.pg{width:1920px;height:1080px;page-break-after:always;display:flex;align-items:center;justify-content:center;background:#f4f2ed;overflow:hidden;position:relative}
.pg:last-child{page-break-after:auto}
.pg img.b{max-width:1840px;max-height:1020px;object-fit:contain}
.cover{flex-direction:column;justify-content:flex-end;align-items:flex-start;padding:110px 130px}
.cover .sky{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 70%}
.cover .wash{position:absolute;inset:0;background:linear-gradient(to bottom,#f4f2ed00 0%,#fbe6a0b0 30%,#f4f2edf2 52%,#f4f2ed 100%)}
.cover>*:not(.sky):not(.wash):not(.list){position:relative}
.sig{width:620px;margin-bottom:40px}
.eb{font-family:'DM Mono';font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#00726d;margin-bottom:18px}
h1{font-family:'EB Garamond';font-weight:400;font-size:88px;line-height:1.05;color:#111110}
h1 em{color:#00908a}
.sub{font-family:'EB Garamond';font-size:30px;color:#444440;margin-top:18px}
.list{position:absolute;right:130px;top:100px;font-family:'DM Mono';font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:#444440;line-height:2.1;text-align:right}
</style></head><body>
<section class="pg cover"><img class="sky" src="file://${SKY}"><div class="wash"></div>
<img class="sig" src="file://${SIG}">
<p class="eb">Site flows · Sprint 1 · October 2026</p>
<h1>Guidance, inspiration, <em>courage</em>, and light.</h1>
<p class="sub">How visitors move through ashleyeadysmith.com, on phone and desktop</p>
<div class="list">01 First hello<br>02 Get POP<br>03 Encouragement Sessions<br>04 Plan a retreat<br>05 Ask about a painting<br>06 Book Ashley to speak<br>07 Listen, and meet her</div>
</section>
${imgs.map((i) => `<section class="pg"><img class="b" src="file://${i}"></section>`).join('')}
</body></html>`;
  const hf = path.join(TMP, 'deck.html'); fs.writeFileSync(hf, html);
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + hf); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete));
  await p.pdf({ path: OUT, width: '1920px', height: '1080px', printBackground: true });
  await b.close(); console.log(OUT);
})();
