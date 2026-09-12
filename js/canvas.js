/**
 * canvas.js
 * -----------------------------------
 * 白龍・桜テーマ用の花びらアニメーション
 * 文字の安全地帯は描画量を抑え、読みやすさを優先する
 * -----------------------------------
 */

(function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const app = document.getElementById('appContainer');
  let W = 0;
  let H = 0;
  let dpr = 1;
  const petals = [];
  const foregroundPetals = [];
  const orbitPetals = [];
  const petalImage = new Image();
  petalImage.src = 'images/petal_particle.png?v=1';

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function petalCount() {
    return W < 520 ? 30 : 52;
  }

  function foregroundPetalCount() {
    return W < 520 ? 10 : 16;
  }

  function resetPetal(p, initial = false) {
    const fromLeft = Math.random() < 0.5;
    const sideBand = W * (Math.random() * 0.22);
    p.x = fromLeft ? -30 + sideBand : W + 30 - sideBand;
    p.y = initial ? Math.random() * H : -40 - Math.random() * 120;
    p.size = 10 + Math.random() * 15;
    p.vx = (fromLeft ? 1 : -1) * (0.42 + Math.random() * 0.72);
    p.vy = 0.38 + Math.random() * 0.72;
    p.swing = Math.random() * Math.PI * 2;
    p.swingSpeed = 0.022 + Math.random() * 0.034;
    p.rotation = Math.random() * Math.PI * 2;
    p.spin = (Math.random() - 0.5) * 0.055;
    p.alpha = 0.58 + Math.random() * 0.28;
  }

  function resetForegroundPetal(p, initial = false) {
    const fromLeft = Math.random() < 0.58;
    p.x = fromLeft ? -70 - Math.random() * 90 : W + 40 + Math.random() * 80;
    p.y = initial ? H * (0.18 + Math.random() * 0.82) : H + 40 + Math.random() * 160;
    p.size = 18 + Math.random() * 26;
    p.vx = (fromLeft ? 1 : -1) * (0.72 + Math.random() * 1.2);
    p.vy = -0.78 - Math.random() * 0.92;
    p.swing = Math.random() * Math.PI * 2;
    p.swingSpeed = 0.026 + Math.random() * 0.036;
    p.rotation = Math.random() * Math.PI * 2;
    p.spin = (Math.random() - 0.5) * 0.068;
    p.alpha = 0.5 + Math.random() * 0.3;
  }

  function initParticles() {
    petals.length = 0;
    foregroundPetals.length = 0;
    orbitPetals.length = 0;

    for (let i = 0; i < petalCount(); i++) {
      const petal = {};
      resetPetal(petal, true);
      petals.push(petal);
    }

    for (let i = 0; i < foregroundPetalCount(); i++) {
      const petal = {};
      resetForegroundPetal(petal, true);
      foregroundPetals.push(petal);
    }

    const orbitCount = W < 520 ? 34 : 52;
    for (let i = 0; i < orbitCount; i++) {
      orbitPetals.push({
        angle: Math.random() * Math.PI * 2,
        radius: 0.25 + Math.random() * 0.34,
        size: 11 + Math.random() * 16,
        speed: 0.005 + Math.random() * 0.008,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.018 + Math.random() * 0.024,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
        alpha: 0.52 + Math.random() * 0.34,
      });
    }
  }

  function isSafeZone(x, y) {
    if (!app) return false;
    const rect = app.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return false;

    const rx = (x - rect.left) / rect.width;
    const ry = (y - rect.top) / rect.height;

    const inTitle = rx > 0.04 && rx < 0.96 && ry > 0.05 && ry < 0.22;
    const inCardText = rx > 0.29 && rx < 0.71 && ry > 0.42 && ry < 0.62;
    const inResultControls = rx > 0.08 && rx < 0.92 && ry > 0.74 && ry < 0.99;
    return inTitle || inCardText || inResultControls;
  }

  function drawPetal(p) {
    if (isSafeZone(p.x, p.y)) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.filter = 'saturate(1.24) contrast(1.08)';

    if (petalImage.complete && petalImage.naturalWidth > 0) {
      const w = p.size * 2.7;
      const h = p.size * 1.75;
      ctx.drawImage(petalImage, -w / 2, -h / 2, w, h);
    } else {
      ctx.scale(1, 0.62);
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.size);
      grad.addColorStop(0, `rgba(255,255,255,${Math.min(p.alpha + 0.18, 0.7)})`);
      grad.addColorStop(0.46, `rgba(255,185,215,${p.alpha})`);
      grad.addColorStop(1, `rgba(255,122,180,${p.alpha * 0.5})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.45, p.size * 0.62, p.size * 0.55, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.62, p.size * 0.55, -p.size * 0.8, -p.size * 0.45, 0, -p.size);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawOrbitPetals() {
    if (!app || !app.classList.contains('result-bg')) return;

    const rect = app.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.55;
    const base = Math.min(rect.width, rect.height) * 0.48;

    for (const p of orbitPetals) {
      p.angle += p.speed;
      p.wobble += p.wobbleSpeed;
      p.rotation += p.spin;

      const rx = base * p.radius * 1.15;
      const ry = base * p.radius * 0.7;
      p.x = cx + Math.cos(p.angle) * rx + Math.sin(p.wobble) * 12;
      p.y = cy + Math.sin(p.angle) * ry + Math.cos(p.wobble) * 8;

      drawPetal(p);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawOrbitPetals();

    for (const p of petals) {
      p.swing += p.swingSpeed;
      p.rotation += p.spin;
      p.x += p.vx + Math.sin(p.swing) * 0.7;
      p.y += p.vy;

      if (p.y > H + 60 || p.x < -100 || p.x > W + 100) {
        resetPetal(p);
      }

      drawPetal(p);
    }

    for (const p of foregroundPetals) {
      p.swing += p.swingSpeed;
      p.rotation += p.spin;
      p.x += p.vx + Math.sin(p.swing) * 1.35;
      p.y += p.vy + Math.cos(p.swing) * 0.35;

      if (p.y < -100 || p.x < -180 || p.x > W + 180) {
        resetForegroundPetal(p);
      }

      drawPetal(p);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
