// Pen-order centerline for the SignatureIdent mask, authored by hand over signature.png
// (viewBox 0 0 1876 855). Lifts are bridged so one stroked path covers all the ink.
// `node scripts/verify-centerline.mjs` measures coverage and writes an overlay.
export const POINTS = [
  // Hand-traced in writing order (left flourish to the final bar), then thinned to
  // 66 points by dropping near-collinear ones while coverage held at 99.9%+.
  [90,845],[35,430],[10,385],[190,320],[240,240],[120,450],[330,330],[250,560],
  [115,650],[445,15],[185,540],[330,420],[395,230],[355,710],[500,180],[440,490],
  [530,330],[470,600],[560,440],[505,680],[715,150],[560,760],[840,20],[670,400],
  [730,480],[830,150],[780,480],[850,420],[820,350],[785,560],[915,340],[905,450],[960,440],
  [985,320],[1000,430],[1060,420],[1075,310],[1100,430],[1185,325],[1110,560],[1030,650],
  [950,610],[1065,200],[1245,50],[1280,220],[1200,420],[1240,430],[1435,45],[1300,355],
  [1520,345],[1440,490],[1500,470],[1530,530],[1465,595],[1290,420],[1510,395],[1630,160],
  [1580,330],[1645,340],[1560,580],[1745,155],[1700,330],[1800,155],[1610,640],[1700,395],
  [1870,375],
];
export const STROKE = 110;

// Catmull-Rom (centripetal-ish, tension 0.5) to cubic Béziers.
export function toPath(pts = POINTS) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.map(Math.round).join(' ')} ${c2.map(Math.round).join(' ')} ${p2.join(' ')}`;
  }
  return d;
}
