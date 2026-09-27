/* SAHNE 1 — VARSAYIM (0–10 s)  İki doğru kesişir mi?
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  /** text with exponents written as ^{…}, centred at x */
  function pw(ctx, str, x, y, size, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0) return;
    const parts = []; let rest = str;
    while (rest.length) { const i = rest.indexOf('^{'); if (i < 0) { parts.push([rest, false]); break; } if (i > 0) parts.push([rest.slice(0, i), false]); const j = rest.indexOf('}', i); parts.push([rest.slice(i + 2, j), true]); rest = rest.slice(j + 1); }
    const W = F().width, ws = parts.map(([s, sup]) => W(ctx, s, sup ? size * 0.6 : size)), tot = ws.reduce((p, q) => p + q, 0);
    let left = x - tot / 2;
    if (o.halo !== false) { ctx.fillStyle = `rgba(${LI.PAPER_RGB},${0.85 * a})`; ctx.fillRect(left - 14, y - size * 0.75, tot + 28, size * 1.35); }
    parts.forEach(([s, sup], i) => { A.text(ctx, s, left, sup ? y - size * 0.38 : y, { size: sup ? size * 0.6 : size, alpha: a, align: 'left', color: o.color }); left += ws[i]; });
  }
  function eqs(ctx, env, t, rows) {
    const E = KD.L(env).EQ;
    rows.forEach(([t0, t1, s, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) pw(ctx, s, E.x, E.y[i], E.s * (hot ? 1.05 : 0.9), { alpha: al, color: hot ? A.amber : undefined }); });
  }
  const P = (env, x, y) => { const C = KD.L(env).CP; return [C.x + x * C.u, C.y - y * C.u]; };
  function plane(ctx, env, a, axes) {
    if (a <= 0) return; const C = KD.L(env).CP, s = KD.L(env).G.s;
    ctx.strokeStyle = `rgba(${LI.INK_RGB},${a * 0.12})`; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = -C.nx; i <= C.nx; i++) { const p = P(env, i, -C.ny), q = P(env, i, C.ny); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    for (let j = -C.ny; j <= C.ny; j++) { const p = P(env, -C.nx, j), q = P(env, C.nx, j); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    if (axes <= 0) return;
    const X0 = P(env, -C.nx - 0.5, 0), X1 = P(env, C.nx + 0.6, 0), Y0 = P(env, 0, -C.ny - 0.5), Y1 = P(env, 0, C.ny + 0.6);
    Ink.path(ctx, [X0, [lerp(X0[0], X1[0], axes), X0[1]]], { w: 3, alpha: a, seed: 1600, taper: [0, 0] });
    Ink.path(ctx, [Y0, [Y0[0], lerp(Y0[1], Y1[1], axes)]], { w: 3, alpha: a, seed: 1601, taper: [0, 0] });
    if (axes >= 1) {
      Ink.path(ctx, [[X1[0] - 12, X1[1] - 8], X1, [X1[0] - 12, X1[1] + 8]], { w: 3, alpha: a, seed: 1602, taper: [0, 0] });
      Ink.path(ctx, [[Y1[0] - 8, Y1[1] + 12], Y1, [Y1[0] + 8, Y1[1] + 12]], { w: 3, alpha: a, seed: 1603, taper: [0, 0] });
      F().T(ctx, 'x', X1[0] + 14, X1[1] + 20, { size: s * 0.7, alpha: a, halo: true }); F().T(ctx, 'y', Y1[0] + 20, Y1[1] - 6, { size: s * 0.7, alpha: a, halo: true });
      F().T(ctx, 'O', P(env, 0, 0)[0] - 18, P(env, 0, 0)[1] + 20, { size: s * 0.62, alpha: a, halo: true });
      for (let i = -C.nx; i <= C.nx; i++) if (i && i % 2 === 0) { const q = P(env, i, 0); F().T(ctx, i < 0 ? `−${-i}` : String(i), q[0], q[1] + 20, { size: s * 0.46, alpha: a * 0.8, halo: true }); }
      for (let j = -C.ny; j <= C.ny; j++) if (j && j % 2 === 0) { const q = P(env, 0, j); F().T(ctx, j < 0 ? `−${-j}` : String(j), q[0] - 20, q[1], { size: s * 0.46, alpha: a * 0.8, halo: true }); }
    }
  }
  function mark(ctx, env, x, y, a, label, color, dx = 0, dy = -30) {
    if (a <= 0) return; const q = P(env, x, y), s = KD.L(env).G.s;
    ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, 7); ctx.fillStyle = color ? `rgba(${color},${a})` : amber(a); ctx.fill();
    if (label) F().T(ctx, label, q[0] + dx, q[1] + dy, { size: s * 0.62, alpha: a, halo: true, color: color ? undefined : A.amber });
  }
  /** y = m x + b clipped to the plane, drawn up to fraction k */
  function ln(ctx, env, m, b, a, k, seed, color, label, lx) {
    if (a <= 0 || k <= 0) return; const C = KD.L(env).CP, s = KD.L(env).G.s;
    let x0 = -C.nx, x1 = C.nx;
    if (m !== 0) { const xa = (C.ny - b) / m, xb = (-C.ny - b) / m; x0 = Math.max(x0, Math.min(xa, xb)); x1 = Math.min(x1, Math.max(xa, xb)); }
    const xe = lerp(x0, x1, k);
    Ink.path(ctx, [P(env, x0, m * x0 + b), P(env, xe, m * xe + b)], { w: 4.5, alpha: a, seed, taper: [0, 0], color });
    if (label && k >= 1) { const x = lx != null ? (lx - b) / m : x1 - 0.8, q = P(env, x, m * x + b); F().T(ctx, label, q[0] + 80, q[1], { size: s * 0.62, alpha: a, halo: true, color: color === LI.AMBER_RGB ? A.amber : undefined }); }
  }
  const AM = LI.AMBER_RGB, IN = LI.INK_RGB;

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'İki doğru kesişir mi?'],
      [10.6, 27.8, 'Eğimleri eşit olan doğrular'],
      [28.4, 45.8, 'Eğimleri farklı olan doğrular'],
      [46.4, 63.8, 'Aynı doğru, iki denklem'],
      [64.4, 79.8, 'Önermelerle karar verelim'],
    ]);
  }

  function figure(ctx, env, t) {
    const a = END(t), aP = a * win(t, 4.6, 79.8);
    plane(ctx, env, aP * seg(t, 4.8, 5.4), seg(t, 5.0, 6.0));
    // S1: a guess
    const s1 = a * win(t, 6.0, 10.2);
    ln(ctx, env, 2, 1, s1, seg(t, 6.2, 7.2), 2000, AM, 'y = 2x + 1', 3.5); ln(ctx, env, 2, -3, s1, seg(t, 7.2, 8.2), 2010, IN, 'y = 2x − 3', -1.5);
    // S2: parallel family
    const s2 = a * win(t, 10.8, 27.8);
    ln(ctx, env, 2, 1, s2, 1, 2020, AM, 'y = 2x + 1', 1.5); ln(ctx, env, 2, -3, s2, 1, 2030, IN, 'y = 2x − 3', -3.5); ln(ctx, env, 2, 4, s2 * seg(t, 16.0, 16.4), seg(t, 16.0, 17.0), 2040, IN, 'y = 2x + 4', 4.5);
    tally(ctx, env, t, [[12.0, 27.8, 'x arttıkça ikisi de 2 artıyor'], [14.0, 27.8, 'Aradaki dikey uzaklık hep 4'], [18.4, 27.8, 'Eğim aynı, sabit farklı'], [21.0, 27.8, 'Hiç kesişmezler: paralel', true]]);
    // S3: different slopes
    const s3 = a * win(t, 28.8, 45.8);
    ln(ctx, env, 2, 1, s3, 1, 2050, AM, 'y = 2x + 1', -3); ln(ctx, env, -1, 4, s3, seg(t, 29.4, 30.6), 2060, IN, 'y = −x + 4', 1.2);
    mark(ctx, env, 1, 3, s3 * seg(t, 32.0, 32.4), '(1, 3)', null, 44, 10);
    ln(ctx, env, 0.5, -1, s3 * seg(t, 38.0, 38.4), seg(t, 38.0, 39.2), 2070, IN, 'y = x/2 − 1', 2.2);
    mark(ctx, env, -4 / 3, -5 / 3, s3 * seg(t, 39.4, 39.8), null, null);
    tally(ctx, env, t, [[31.0, 45.8, '2x + 1 = −x + 4 → x = 1, y = 3'], [34.0, 45.8, 'Eğimler farklı: bir noktada kesişir'], [38.4, 45.8, 'Başka bir eğim: yine tek nokta'], [41.0, 45.8, 'Farklı eğim → tek kesişim noktası', true]]);
    // S4: coincide
    const s4 = a * win(t, 46.8, 63.8);
    ln(ctx, env, 2, 1, s4, seg(t, 47.2, 48.4), 2080, AM, null);
    ln(ctx, env, 2, 1, s4 * seg(t, 51.0, 51.4) * 0.6, seg(t, 51.0, 52.4), 2090, IN, null);
    [[-2, -3], [0, 1], [1, 3]].forEach(([x, y], i) => mark(ctx, env, x, y, s4 * seg(t, 53.4 + i * 0.6, 53.8 + i * 0.6), `(${x < 0 ? '−' + -x : x}, ${y < 0 ? '−' + -y : y})`, null, 44, 12));
    tally(ctx, env, t, [[48.6, 63.8, 'y = 2x + 1'], [50.0, 63.8, '2y = 4x + 2 → y = 2x + 1'], [53.0, 63.8, 'Bütün noktaları ortak'], [56.0, 63.8, 'Eğim ve sabit aynı: çakışık', true]]);
    // S5: judge new pairs
    const s5 = a * win(t, 64.8, 79.8);
    const pairs = [[65.2, 69.2, [3, -2], [3, 5]], [69.4, 73.4, [1, 2], [-2, 5]], [73.6, 79.8, [-1, 1], [-1, 1]]];
    pairs.forEach(([t0, t1, [m1, b1], [m2, b2]], i) => { const k = a * win(t, t0, t1); ln(ctx, env, m1, b1, k, seg(t, t0 + 0.2, t0 + 1.0), 2100 + i * 20, AM); ln(ctx, env, m2, b2, k * (i === 2 ? 0.6 : 1), seg(t, t0 + 0.6, t0 + 1.4), 2110 + i * 20, IN); });
    tally(ctx, env, t, [[65.6, 79.8, 'y = 3x − 2 · y = 3x + 5: paralel'], [69.8, 79.8, 'y = x + 2 · y = −2x + 5: (1, 3)’te kesişir'], [74.0, 79.8, 'y = −x + 1 · y = 1 − x: çakışık', true]]);
    void s5;
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[6.0, 10.2, 'Varsayım: bu iki doğru bir yerde kesişir mi?'],
      [11.4, 27.8, 'Eğimi 2 olan doğrular çizelim'],
      [29.4, 45.8, 'Eğimleri farklı iki doğru'],
      [47.4, 63.8, 'İki denklem, aynı doğru mu?'],
      [65.4, 79.8, 'Yalnızca denklemlere bakarak karar verelim']]);
    exprs(ctx, t, at(W, 1), [[8.4, 10.2, 'Eğimleri aynı, sabitleri farklı'], [23.0, 27.8, 'Varsayımımız yanlıştı: kesişmiyorlar'],
      [42.0, 45.8, 'Kesişim noktası iki denklemi de sağlar'],
      [58.0, 63.8, 'Denklemi sadeleştirince aynısı çıktı'],
      [76.0, 79.8, 'Eğim ve sabit, doğruların durumunu söyler']]);
    exprs(ctx, t, at(W, 2), [[9.4, 10.2, 'Tahmin et, sonra sına', true], [25.0, 27.8, 'Eğim eşit → paralel', true],
      [44.0, 45.8, 'Eğim farklı → kesişir', true], [60.4, 63.8, 'Hepsi aynı → çakışık', true], [78.0, 79.8, 'Grafik çizmeden karar!', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Eğim eşit, sabit farklı: paralel', 80.6], ['Eğim farklı: tek noktada kesişir', 81.6], ['Eğim ve sabit aynı: çakışık', 82.6], ['Denkleme bak, durumu söyle!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'A guess', nameTr: 'Varsayım', concept: 'Do they meet?', conceptTr: 'Kesişirler mi?', render });
})(window.LI = window.LI || {});
