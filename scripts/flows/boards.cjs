// Flow capture, step 2 of 3. Lays each flow out as a presentation board PNG.
// Usage: node scripts/flows/boards.cjs <shotsDir> <outDir> mobile|desktop
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const SHOTS = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3]);
const DEV = process.argv[4] || 'mobile';
const D = DEV === 'desktop';
const dcss = `
.step.d{width:640px}
.browser{width:640px;border-radius:12px;overflow:hidden;border:1px solid #cfcac0;box-shadow:0 30px 60px -30px rgba(40,30,20,.45);background:#fff}
.bar{height:30px;background:#ebe8e1;display:flex;align-items:center;gap:7px;padding:0 12px;border-bottom:1px solid #d6d3cc}
.bar i{width:10px;height:10px;border-radius:50%;background:#d6d3cc;display:block}
.bar span{margin-left:14px;flex:1;height:18px;border-radius:9px;background:#f9f9f7;font-family:'DM Mono';font-size:10px;color:#888882;display:flex;align-items:center;padding-left:10px;letter-spacing:.06em}
.browser img{width:640px;height:400px;display:block}
.arrow.d{height:430px}
.row.wrap{flex-wrap:wrap;row-gap:44px;width:2060px}
`;
const NM = require('path').resolve(__dirname, '../../node_modules/@fontsource');
const SIG = require('path').resolve(__dirname, '../../public/brand/signature.svg');

const flows = [
  { id: 'f1', n: '01', title: 'First <em>hello</em>', sub: 'The first time someone visits, her signature writes itself, then settles into the top corner as the site’s mark. Under 3½ seconds; one tap skips it.',
    steps: ['The pen starts at the left flourish', 'Her name writes itself', 'A soft glow behind the ink', 'It flies up into the header', 'The home page: sky, name, promise'] },
  { id: 'f2', n: '02', title: 'Get <em>POP</em>', sub: 'Little Pocket of Prayers, from the home page to checkout.',
    steps: ['Tap the “Get POP” note on Home', 'Shop: what POP is, format and price', 'Tap the note → secure Stripe checkout (link coming)'] },
  { id: 'f3', n: '03', title: 'Book an <em>Encouragement Session</em>', sub: 'One-on-one time with Ashley.',
    steps: ['Tap “Sessions” on Home', 'Tap “Book a session” → Stripe checkout or booking (Ashley to choose)'] },
  { id: 'f4', n: '04', title: 'Plan a <em>retreat</em>', sub: 'Groups and companies send an inquiry; Ashley replies personally.',
    steps: ['Tap “Plan a retreat” in the Shop', 'Contact form opens with “Retreat” already chosen', 'Sent: a thank-you page'] },
  { id: 'f5', n: '05', title: 'Ask about a <em>painting</em>', sub: 'Every artwork can be opened large. Pieces marked available get a note to ask about them.',
    steps: ['The gallery (her photos go here)', 'Tap any piece to see it large', 'Available pieces: “Ask about this piece”', 'The form knows which piece and says so'] },
  { id: 'f6', n: '06', title: 'Book Ashley to <em>speak</em>', sub: 'Her talks come straight from her YouTube channel, newest first. New uploads appear automatically.',
    steps: ['Speaking: her talks, ready to play', 'Tap “Book Ashley to speak”', 'Form opens with “Speaking” chosen'] },
  { id: 'f7', n: '07', title: 'Listen, and meet <em>her</em>', sub: 'Her songs play right on the page. About tells her story in her own words.',
    steps: ['Music: Momma Gone plays on the page', 'About: portrait and her story (her words to come)'] },
];

const font = (f) => 'file://' + path.join(NM, f);
const css = `
@font-face{font-family:'EB Garamond';src:url(${font('eb-garamond/files/eb-garamond-latin-400-normal.woff2')}) format('woff2');font-weight:400}
@font-face{font-family:'EB Garamond';src:url(${font('eb-garamond/files/eb-garamond-latin-400-italic.woff2')}) format('woff2');font-style:italic}
@font-face{font-family:'DM Mono';src:url(${font('dm-mono/files/dm-mono-latin-400-normal.woff2')}) format('woff2')}
*{box-sizing:border-box;margin:0}
body{background:#f4f2ed;color:#111110;font-family:'EB Garamond',serif;padding:72px 80px 64px;display:inline-block}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:60px;margin-bottom:48px}
.eyebrow{font-family:'DM Mono';font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#00726d;margin-bottom:14px}
h1{font-weight:400;font-size:64px;line-height:1.05}
h1 em{color:#00908a}
.sub{font-size:24px;line-height:1.45;color:#444440;max-width:46ch;margin-top:16px}
.sig{width:200px;opacity:.9;margin-top:8px}
.row{display:flex;align-items:flex-start;gap:0}
.step{width:390px;display:flex;flex-direction:column}
.phone{width:390px;height:844px;border-radius:36px;overflow:hidden;border:10px solid #111110;box-shadow:0 30px 60px -30px rgba(40,30,20,.45);background:#fff}
.phone img{width:100%;height:100%;display:block}
.cap{display:flex;gap:12px;margin-top:22px;align-items:baseline}
.num{font-family:'DM Mono';font-size:15px;color:#00726d;letter-spacing:.1em;flex:0 0 auto}
.txt{font-size:22px;line-height:1.35}
.arrow{width:70px;height:844px;display:flex;align-items:center;justify-content:center;color:#f48067;font-size:40px;flex:0 0 auto}
.foot{margin-top:46px;padding-top:18px;border-top:1px solid #d6d3cc;font-family:'DM Mono';font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#444440;display:flex;justify-content:space-between}
`;

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ deviceScaleFactor: 1.5 })).newPage();
  for (const f of flows) {
    const imgs = f.steps.map((_, i) => `file://${SHOTS}/${DEV}-${f.id}-${String(i + 1).padStart(2, '0')}.png`);
    imgs.forEach((u) => { if (!fs.existsSync(u.slice(7))) throw new Error('missing ' + u); });
    const frame = (src) => D
      ? `<div class="browser"><div class="bar"><i></i><i></i><i></i><span>ashleyeadysmith.com</span></div><img src="${src}"></div>`
      : `<div class="phone"><img src="${src}"></div>`;
    const row = f.steps.map((s, i) => `${i ? `<div class="arrow${D ? ' d' : ''}">→</div>` : ''}<div class="step${D ? ' d' : ''}">${frame(imgs[i])}<div class="cap"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="txt">${D ? s.replace(/\bTap\b/g, "Click").replace(/\btap\b/g, "click") : s}</span></div></div>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}${dcss}</style></head><body>
      <div class="top"><div><p class="eyebrow">Flow ${f.n} · ${D ? 'Desktop' : 'Phone'} · ashleyeadysmith.com</p><h1>${f.title}</h1><p class="sub">${f.sub}</p></div><img class="sig" src="file://${SIG}"></div>
      <div class="row${D && f.steps.length > 3 ? ' wrap' : ''}">${row}</div>
      <div class="foot"><span>Sprint 1 preview · October 2026</span><span>Coral ring = where you ${D ? "click" : "tap"}</span></div></body></html>`;
    const file = path.join(OUT, `_${f.id}.html`);
    fs.writeFileSync(file, html);
    await p.goto('file://' + file);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => [...document.images].every((i) => i.complete));
    const slug = f.title.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
    await p.locator('body').screenshot({ path: path.join(OUT, `${f.n}-${slug}-${DEV}.png`) });
    fs.unlinkSync(file);
    console.log(`${f.n}-${slug}-${DEV}.png`);
  }
  await b.close();
})();
