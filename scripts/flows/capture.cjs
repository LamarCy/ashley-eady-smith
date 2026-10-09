// Flow capture, step 1 of 3. Screenshots each user flow from the live site.
// Usage: node scripts/flows/capture.cjs <shotsDir> mobile|desktop   (or: npm run flows)
const { chromium } = require('playwright');
const BASE = process.env.FLOWS_URL || 'https://ashleyeadysmith.com';
const O = require('path').resolve(process.argv[2]);
const DEV = process.argv[3] || 'mobile';
const VP = DEV === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 };
const DPR = DEV === 'desktop' ? 1 : 2;
const ring = (p, sel) => p.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return 'missing ' + sel;
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = '__ring';
  Object.assign(d.style, { position: 'fixed', left: r.left - 8 + 'px', top: r.top - 8 + 'px', width: r.width + 16 + 'px', height: r.height + 16 + 'px', border: '3px solid #f48067', borderRadius: '10px', zIndex: 9999, pointerEvents: 'none', boxShadow: '0 0 0 6px rgba(244,128,103,.18)' });
  document.body.append(d); return 'ok';
}, sel).then((r) => { if (r !== 'ok') console.log(r); });
const clear = (p) => p.evaluate(() => document.querySelectorAll('.__ring').forEach((e) => e.remove()));
const settle = async (p) => {
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
  await p.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(500);
};
(async () => {
  const b = await chromium.launch();
  const mk = (reduced) => b.newContext({ viewport: VP, deviceScaleFactor: DPR, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  let n = 0;
  const shot = async (p, flow, step) => { await p.screenshot({ path: `${O}/${DEV}-${flow}-${String(step).padStart(2, '0')}.png` }); n++; };

  // 1. First visit: the signature writes itself
  { const c = await mk(false); const p = await c.newPage(); await p.goto(BASE + '/', { waitUntil: 'commit' });
    let i = 1;
    // Frames keyed to the animation's real progress, not wall-clock time.
    const drawn = (frac) => p.waitForFunction((frac) => {
      const pen = document.querySelector('.ident-pen'); if (!pen) return false;
      const a = pen.getAnimations()[0]; if (!a) return false;
      return a.effect.getComputedTiming().progress >= frac;
    }, frac, { polling: 'raf', timeout: 15000 });
    await drawn(0.12); await shot(p, 'f1', i++);
    await drawn(0.45); await shot(p, 'f1', i++);
    await p.waitForFunction(() => { const g = document.querySelector('.ident-glow'); return g && g.getAnimations().some((a) => a.currentTime > 160); }, null, { polling: 'raf', timeout: 15000 }); await shot(p, 'f1', i++);
    await p.waitForFunction(() => { const s = document.querySelector('.ident-sig'); return s && s.getAnimations().some((a) => a.effect.getComputedTiming().progress > 0.5); }, null, { polling: 'raf', timeout: 15000 }); await shot(p, 'f1', i++);
    await p.waitForTimeout(1200); await shot(p, 'f1', i++); await c.close(); }

  // Remaining flows: ident already seen; reduced motion so notes sit still.
  const c = await mk(true); await c.addInitScript(() => sessionStorage.setItem('aesIdentSeen', '1'));
  const p = await c.newPage();

  // 2. Get POP
  await p.goto(BASE + '/'); await settle(p); await ring(p, '.offers-home .note-cta:nth-child(1)'); await shot(p, 'f2', 1); await clear(p);
  await p.goto(BASE + '/shop/'); await settle(p); await ring(p, '.offer:nth-child(1) .offer-text'); await shot(p, 'f2', 2); await clear(p);
  await ring(p, '.offer:nth-child(1) .note-cta'); await shot(p, 'f2', 3); await clear(p);

  // 3. Book an Encouragement Session
  await p.goto(BASE + '/'); await settle(p); await ring(p, '.offers-home .note-cta:nth-child(2)'); await shot(p, 'f3', 1); await clear(p);
  await p.goto(BASE + '/shop/'); await settle(p); await ring(p, '.offer:nth-child(2) .note-cta'); await shot(p, 'f3', 2); await clear(p);

  // 4. Plan a retreat (form filled, not sent)
  await p.goto(BASE + '/shop/'); await settle(p); await ring(p, '.offer:nth-child(3) .note-cta'); await shot(p, 'f4', 1); await clear(p);
  await p.goto(BASE + '/contact/?interest=retreat'); await settle(p);
  await p.fill('input[name=name]', 'Jordan Rivers'); await p.fill('input[name=email]', 'jordan@example.com');
  await p.fill('textarea', 'Our team of 25 would love a half-day retreat this spring.');
  await ring(p, '#interest'); await shot(p, 'f4', 2); await clear(p);
  await p.goto(BASE + '/thanks/'); await settle(p); await shot(p, 'f4', 3);

  // 5. Ask about an artwork
  await p.goto(BASE + '/art/'); await settle(p); await ring(p, '.work:nth-child(1) .work-open'); await shot(p, 'f5', 1); await clear(p);
  await p.click('.work:nth-child(1) .work-open'); await p.waitForTimeout(400); await shot(p, 'f5', 2); await p.keyboard.press('Escape'); await p.evaluate(() => document.activeElement.blur());
  await ring(p, '.work-note .note-cta'); await shot(p, 'f5', 3); await clear(p);
  await p.goto(BASE + '/contact/?interest=artwork&piece=placeholder-1'); await settle(p); await ring(p, '#piece-note'); await shot(p, 'f5', 4); await clear(p);

  // 6. Book Ashley to speak
  await p.goto(BASE + '/speaking/'); await settle(p); await shot(p, 'f6', 1);
  await ring(p, '.book .note-cta'); await shot(p, 'f6', 2); await clear(p);
  await p.goto(BASE + '/contact/?interest=speaking'); await settle(p); await ring(p, '#interest'); await shot(p, 'f6', 3); await clear(p);

  // 7. Listen, then meet her
  await p.goto(BASE + '/music/'); await settle(p); await ring(p, '.track[open] .track-player audio'); await shot(p, 'f7', 1); await clear(p);
  await p.goto(BASE + '/about/'); await settle(p); await shot(p, 'f7', 2);

  console.log('shots', n);
  await b.close();
})();
