/**
 * canvas.js
 * -----------------------------------
 * 背景の星空アニメーション（Canvas）
 * カード裏面のパターン描画
 * -----------------------------------
 */

// ========== 背景星空 ==========
(function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const stars = [];
  const STAR_COUNT = 120;
  const nebulas = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random(),
        da: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        speed: Math.random() * 0.08 + 0.02,
      });
    }
    nebulas.length = 0;
    for (let i = 0; i < 4; i++) {
      nebulas.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 180 + 80,
        color: Math.random() < 0.5
          ? `rgba(106,26,154,${Math.random() * 0.06 + 0.02})`
          : `rgba(30,8,80,${Math.random() * 0.08 + 0.02})`,
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
      ctx.fillStyle = `rgba(201,168,76,${s.a * 0.8})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });

  resize();
  initStars();
  draw();
})();

// ========== カード裏面パターン ==========
function drawCardFrontPattern(container) {
  // 既存のcanvasがあれば削除
  const existing = container.querySelector('canvas');
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 310;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const W = 200, H = 310;

  // 背景グラデーション
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a0838');
  bg.addColorStop(0.5, '#2d1060');
  bg.addColorStop(1, '#130428');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 枠線
  ctx.strokeStyle = 'rgba(201,168,76,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  ctx.strokeStyle = 'rgba(201,168,76,0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  // 幾何学模様（星形）
  ctx.save();
  ctx.translate(W / 2, H / 2);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(8, -20);
    ctx.lineTo(70, 0);
    ctx.lineTo(8, 20);
    ctx.lineTo(0, 70);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-70, 0);
    ctx.lineTo(-8, -20);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(201,168,76,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();

  // 中央の月マーク
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(201,168,76,0.6)';
  ctx.fillText('🌙', 0, 0);
  ctx.restore();

  // 上下テキスト
  ctx.font = '7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(201,168,76,0.4)';
  ctx.letterSpacing = '3px';
  ctx.fillText('✦ THE ORACLE ✦', W / 2, H - 24);
  ctx.fillText('✦ TAROT ✦', W / 2, 24);
}
