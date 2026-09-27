/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 8. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Kesişirler mi?', en: 'Do they meet?',
      note: 'y eşittir 2x artı 1 ve y eşittir 2x eksi 3. Eğimleri aynı, sabitleri farklı. Varsayalım: bir yerde kesişirler mi?' },
    { scene: 2, start: 10.8, end: 20.8, tr: 'Aynı eğim', en: 'The same slope',
      note: 'x arttıkça iki doğru da 2 artıyor; aralarındaki dikey uzaklık hep 4. Eğimi 2 olan üçüncü bir doğru da aynı yöne gidiyor.' },
    { scene: 2, start: 21.0, end: 27.8, tr: 'Paralel doğrular', en: 'Parallel lines',
      note: 'Eğimleri eşit, sabitleri farklı doğrular hiç kesişmez: paraleldir. Varsayımımız yanlıştı.' },
    { scene: 3, start: 28.8, end: 37.8, tr: 'Farklı eğim', en: 'Different slopes',
      note: 'y eşittir 2x artı 1 ile y eşittir eksi x artı 4. 2x artı 1, eksi x artı 4’e eşit olunca x 1, y 3: doğrular (1, 3) noktasında kesişir.' },
    { scene: 3, start: 38.0, end: 45.8, tr: 'Tek kesişim noktası', en: 'One point of intersection',
      note: 'Başka bir eğimle de tek nokta. Eğimleri farklı iki doğru tek bir noktada kesişir.' },
    { scene: 4, start: 46.8, end: 55.8, tr: 'İki denklem, bir doğru', en: 'Two equations, one line',
      note: '2y eşittir 4x artı 2 denklemini sadeleştirelim: y eşittir 2x artı 1. Aynı doğru!' },
    { scene: 4, start: 56.0, end: 63.8, tr: 'Çakışık doğrular', en: 'Coinciding lines',
      note: 'Eğimleri ve sabitleri aynı iki doğrunun bütün noktaları ortaktır: çakışıktır.' },
    { scene: 5, start: 64.8, end: 73.4, tr: 'Denklemden karar', en: 'Deciding from the equations',
      note: 'y eşittir 3x eksi 2 ile 3x artı 5: eğim aynı, sabit farklı, paralel. y eşittir x artı 2 ile eksi 2x artı 5: eğimler farklı, (1, 3)’te kesişir.' },
    { scene: 5, start: 73.6, end: 79.8, tr: 'Çakışık', en: 'Coinciding',
      note: 'y eşittir eksi x artı 1 ile 1 eksi x: aynı doğru, çakışık. Grafik çizmeden karar verdik.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Paralel, kesişen, çakışık', en: 'Parallel, intersecting, coinciding',
      note: 'Aklında kalsın: eğim eşit sabit farklıysa paralel; eğim farklıysa tek noktada kesişir; ikisi de aynıysa çakışık.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Denkleme bak!', en: 'Look at the equation!',
      note: 'Denkleme bak, durumu söyle!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
