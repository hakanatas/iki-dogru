/* ─────────────────────────────────────────────────────────────
   Angle kit in the ink style.
   ENCODING (same all film long, so children learn to read it):
     black brush lines  = the angle's arms (ışınlar)
     AMBER              = a MEASUREMENT: the opening arc and its degrees
   Degrees are measured counter-clockwise from the arm that points right.
   ───────────────────────────────────────────────────────────── */
(function (LI) {
  'use strict';
  const { clamp, lerp } = LI.E;
  const Ink = LI.Ink;
  const D2R = Math.PI / 180;
  const dir = (deg) => [Math.cos(-deg * D2R), Math.sin(-deg * D2R)];
  const at = (O, deg, r) => { const d = dir(deg); return [O[0] + d[0] * r, O[1] + d[1] * r]; };
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;

  function arm(ctx, O, deg, len, o = {}) {
    const E = at(O, deg, len);
    Ink.path(ctx, [O, E], { w: o.w ?? 8, p: o.p ?? 1, seed: o.seed ?? 1, taper: [0.03, 0.35], wob: 0.2, dry: 0.4, bleed: 0.5, alpha: o.alpha ?? 1 });
    if ((o.p ?? 1) >= 1 && o.arrow !== false) {
      const L = 26, s = 0.5, a = -deg * D2R;
      const b1 = [E[0] - Math.cos(a - s) * L, E[1] - Math.sin(a - s) * L], b2 = [E[0] - Math.cos(a + s) * L, E[1] - Math.sin(a + s) * L];
      Ink.path(ctx, [b1, E, b2], { w: 6, seed: (o.seed ?? 1) + 3, taper: [0.2, 0.2], alpha: o.alpha ?? 1 });
    }
    return E;
  }

  /** amber arc from deg0 to deg1 at radius r (draw-on p) */
  function arc(ctx, O, r, deg0, deg1, o = {}) {
    const n = Math.max(6, Math.round(Math.abs(deg1 - deg0) / 3)), pts = [];
    for (let i = 0; i <= n; i++) pts.push(at(O, lerp(deg0, deg1, i / n), r));
    Ink.path(ctx, pts, { w: o.w ?? 7, p: o.p ?? 1, color: LI.AMBER_RGB, alpha: o.alpha ?? 1, taper: [0.1, 0.1], wob: 0.15, seed: o.seed ?? 7 });
  }
  /** soft amber fill of the opening (a wedge) */
  function wedge(ctx, O, r, deg0, deg1, a = 0.18) {
    if (a <= 0 || Math.abs(deg1 - deg0) < 0.2) return;
    ctx.fillStyle = amber(a);
    ctx.beginPath(); ctx.moveTo(O[0], O[1]);
    const n = Math.max(6, Math.round(Math.abs(deg1 - deg0) / 3));
    for (let i = 0; i <= n; i++) { const q = at(O, lerp(deg0, deg1, i / n), r); ctx.lineTo(q[0], q[1]); }
    ctx.closePath(); ctx.fill();
  }

  function text(ctx, s, x, y, o = {}) {
    const p = o.p ?? 1, a = o.alpha ?? 1;
    if (p <= 0 || a <= 0) return;
    const size = o.size ?? 60;
    ctx.save();
    ctx.font = `${o.font ?? `${size}px "LI Brush", "Comic Sans MS", cursive`}`;
    ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(s).width;
    const left = ctx.textAlign === 'center' ? x - w / 2 : ctx.textAlign === 'right' ? x - w : x;
    ctx.beginPath(); ctx.rect(left - 8, y - size, (w + 16) * clamp(p), size * 2); ctx.clip();
    if (o.halo) { ctx.fillStyle = `rgba(${LI.PAPER_RGB},${0.85 * a})`; ctx.fillRect(left - 14, y - size * 0.62, w + 28, size * 1.2); }
    ctx.fillStyle = o.color ? o.color(a) : `rgba(${LI.INK_RGB},${a})`;
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  const deg = (ctx, v, x, y, o = {}) => text(ctx, `${Math.round(v)}°`, x, y, Object.assign({ color: amber, size: 76 }, o));

  /** little square that marks 90° */
  function square(ctx, O, deg0, s = 40, o = {}) {
    const a = at(O, deg0, s), c = at(O, deg0 + 90, s), b = [a[0] + c[0] - O[0], a[1] + c[1] - O[1]];
    Ink.path(ctx, [a, b, c], { w: 5, p: o.p ?? 1, color: LI.AMBER_RGB, taper: [0.05, 0.05], alpha: o.alpha ?? 1 });
  }

  /** a numbered step badge: an ensō circle with a digit */
  function badge(ctx, n, x, y, o = {}) {
    const p = o.p ?? 1, a = o.alpha ?? 1;
    if (p <= 0 || a <= 0) return;
    Ink.ring(ctx, x, y, 40, { w: 6, p, seed: 60 + n, alpha: a, dry: 0.5 });
    text(ctx, String(n), x, y + 4, { size: 58, p: clamp(p * 2 - 1), alpha: a });
  }

  /** 360 tick marks around a circle, revealed counter-clockwise from 0° */
  function ticks(ctx, O, r, p, o = {}) {
    const n = Math.floor(360 * clamp(p));
    ctx.strokeStyle = `rgba(${LI.INK_RGB},${o.alpha ?? 0.8})`;
    ctx.lineWidth = o.lw ?? 1.6;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const L = i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9;
      const q0 = at(O, i, r), q1 = at(O, i, r + L);
      ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]);
    }
    ctx.stroke();
  }

  /**
   * The protractor (açıölçer), drawn in ink.
   * C: centre, rot: rotation in degrees (0 = baseline horizontal), R: radius.
   * o.read: highlight value (0–180) on the scale, o.alpha
   * One scale only (0 on the right) — keeps the first lesson simple.
   */
  function protractor(ctx, C, R, rot, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0.01) return;
    ctx.save(); ctx.translate(C[0], C[1]); ctx.rotate(-rot * D2R);
    // translucent body
    ctx.beginPath(); ctx.moveTo(-R - 18, 0); ctx.arc(0, 0, R + 18, Math.PI, 0); ctx.lineTo(R + 18, 16); ctx.lineTo(-R - 18, 16); ctx.closePath();
    ctx.fillStyle = `rgba(255,252,244,${0.62 * a})`; ctx.fill();
    ctx.fillStyle = `rgba(${LI.INK_RGB},${0.04 * a})`; ctx.fill();
    const outline = []; for (let i = 0; i <= 60; i++) { const t = Math.PI + (i / 60) * Math.PI; outline.push([Math.cos(t) * (R + 18), Math.sin(t) * (R + 18)]); }
    Ink.path(ctx, outline.concat([[R + 18, 16], [-R - 18, 16], [-R - 18, 0]]), { w: 4, alpha: a, taper: [0, 0], wob: 0.15, seed: 90, dry: 0.3 });
    // inner window
    const inner = []; for (let i = 0; i <= 40; i++) { const t = Math.PI + (i / 40) * Math.PI; inner.push([Math.cos(t) * R * 0.46, Math.sin(t) * R * 0.46]); }
    Ink.path(ctx, inner, { w: 2.4, alpha: 0.6 * a, taper: [0, 0], seed: 91 });
    // baseline (the 0–180 line) and centre mark
    Ink.path(ctx, [[-R, 0], [R, 0]], { w: 3, alpha: a, taper: [0, 0], seed: 92 });
    Ink.path(ctx, [[0, -22], [0, 10]], { w: 3, alpha: a, taper: [0, 0], seed: 93 });
    // ticks and numbers (0 on the right, counter-clockwise)
    ctx.lineCap = 'round';
    for (let d = 0; d <= 180; d++) {
      const L = d % 10 === 0 ? 30 : d % 5 === 0 ? 20 : 11;
      const c = Math.cos(-d * D2R), s = Math.sin(-d * D2R);
      const hot = o.read != null && d <= o.read && d % 10 === 0;
      ctx.strokeStyle = hot ? amber(a) : `rgba(${LI.INK_RGB},${0.85 * a})`;
      ctx.lineWidth = d % 10 === 0 ? 2.6 : 1.3;
      ctx.beginPath(); ctx.moveTo(c * R, s * R); ctx.lineTo(c * (R - L), s * (R - L)); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let d = 0; d <= 180; d += 10) {
      const c = Math.cos(-d * D2R), s = Math.sin(-d * D2R), rr = R - 52;
      const hot = o.read != null && Math.abs(d - o.read) < 0.5;
      ctx.save(); ctx.translate(c * rr, s * rr); ctx.rotate(-d * D2R + Math.PI / 2);
      ctx.font = `${hot ? 700 : 600} ${hot ? 30 : 22}px "LI Mono", ui-monospace, monospace`;
      ctx.fillStyle = hot ? amber(a) : `rgba(${LI.INK_RGB},${0.9 * a})`;
      ctx.fillText(String(d), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  LI.Ang = { dir, at, arm, arc, wedge, text, deg, square, badge, ticks, protractor, amber, D2R };
})(window.LI = window.LI || {});
