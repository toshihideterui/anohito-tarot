/**
 * canvas.js
 * -----------------------------------
 * 背景の星空アニメーション（Canvas）
 * ※カード画像は実画像ファイルを使用するため、Canvas描画は背景のみ
 * -----------------------------------
 */

(function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const stars   = [];
  const nebulas = [];
  const STAR_COUNT = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.2 + 0.2,
        a:     Math.random(),
        da:    (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        speed: Math.random() * 0.08 + 0.02,
      });
    }
    nebulas.length = 0;
    for (let i = 0; i < 4; i++) {
      nebulas.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 180 + 80,
        color: Math.random() < 0.5
          ? `rgba(106,26,154,${(Math.random() * 0.06 + 0.02).toFixed(3)})`
          : `rgba(30,8,80,${(Math.random() * 0.08 + 0.02).toFixed(3)})`,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 星雲
    for (const n of nebulas) {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 星
    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${(s.a * 0.8).toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize();
  initStars();
  draw();
})();
