/* SAHNE 6 — ÖZET (80–92 s) */
(function (LI) {
  'use strict';
  const KD = LI.KD, F = () => LI.Film;
  function camera(t, env) { return LI.Camera.breathe(KD.cam(env, { zoom: 1 }), t, 0.4); }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); LI.fireworks(ctx, env, t); }
  LI.registerScene({ id: 6, start: 80, end: 92, name: "Summary", nameTr: "Özet", concept: "Two lines", conceptTr: "İki doğru", render });
})(window.LI = window.LI || {});
