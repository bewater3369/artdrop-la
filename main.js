const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  }
);

reveals.forEach((el) => observer.observe(el));

const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const tiles = hero.querySelectorAll('.tile');
  let parallaxActive = false;
  const canvas = hero.querySelector('.hero-canvas');
  let stopAnimation = false;

  const updateSpot = (x, y) => {
    hero.style.setProperty('--spot-x', `${x}%`);
    hero.style.setProperty('--spot-y', `${y}%`);
  };

  const handleMove = (event) => {
    if (!parallaxActive) return;
    const rect = hero.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    updateSpot(Math.max(0, Math.min(100, x * 100)), Math.max(0, Math.min(100, y * 100)));

    const shiftX = (x - 0.5) * 2;
    const shiftY = (y - 0.5) * 2;
    tiles.forEach((tile) => {
      const speed = Number(tile.dataset.speed || 8);
      tile.style.setProperty('--px', `${shiftX * speed}px`);
      tile.style.setProperty('--py', `${shiftY * speed}px`);
    });
  };

  hero.addEventListener('mousemove', handleMove);
  hero.addEventListener('touchmove', handleMove, { passive: true });
  hero.addEventListener('mouseleave', () => {
    updateSpot(65, 35);
    tiles.forEach((tile) => {
      tile.style.setProperty('--px', '0px');
      tile.style.setProperty('--py', '0px');
    });
  });
  updateSpot(65, 35);

  setTimeout(() => {
    parallaxActive = true;
  }, 1200);

  if (canvas) {
    const ctx = canvas.getContext('2d');
    const noiseCanvas = document.createElement('canvas');
    const nctx = noiseCanvas.getContext('2d');
    const palette = [
      [18, 18, 22],
      [70, 30, 60],
      [140, 60, 90],
      [230, 90, 110],
      [80, 170, 220],
      [255, 180, 120],
    ];

    let width = 0;
    let height = 0;
    let noiseW = 0;
    let noiseH = 0;
    let frame = 0;

    const rand = (x, y) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (t) => t * t * (3 - 2 * t);

    const noise = (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const r00 = rand(xi, yi);
      const r10 = rand(xi + 1, yi);
      const r01 = rand(xi, yi + 1);
      const r11 = rand(xi + 1, yi + 1);
      const u = smooth(xf);
      const v = smooth(yf);
      return lerp(lerp(r00, r10, u), lerp(r01, r11, u), v);
    };

    const colorAt = (t) => {
      const scaled = t * (palette.length - 1);
      const idx = Math.floor(scaled);
      const frac = scaled - idx;
      const c1 = palette[idx];
      const c2 = palette[Math.min(idx + 1, palette.length - 1)];
      return [
        Math.round(lerp(c1[0], c2[0], frac)),
        Math.round(lerp(c1[1], c2[1], frac)),
        Math.round(lerp(c1[2], c2[2], frac)),
      ];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const target = 180;
      const aspect = rect.width / rect.height;
      noiseW = Math.floor(target * aspect);
      noiseH = target;
      noiseCanvas.width = noiseW;
      noiseCanvas.height = noiseH;
    };

    const draw = (time) => {
      if (stopAnimation) return;
      const t = time * 0.00018;
      const image = nctx.createImageData(noiseW, noiseH);
      const data = image.data;
      const freq = 2.1;
      const flowX = Math.cos(t * 2.1) * 0.8;
      const flowY = Math.sin(t * 1.7) * 0.8;

      for (let y = 0; y < noiseH; y += 1) {
        for (let x = 0; x < noiseW; x += 1) {
          const nx = (x / noiseW) * freq + flowX;
          const ny = (y / noiseH) * freq + flowY;
          const n1 = noise(nx + t * 1.8, ny + t * 1.2);
          const n2 = noise(nx * 2.2 - t * 1.1, ny * 2.2 + t * 1.4) * 0.5;
          const n3 = noise(nx * 0.6 + t * 0.7, ny * 0.6 - t * 0.9) * 0.35;
          let v = n1 * 0.7 + n2 + n3;
          v = Math.min(1, Math.max(0, v));
          const [r, g, b] = colorAt(v);
          const idx = (y * noiseW + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      nctx.putImageData(image, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.9;
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      frame += 1;
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);

    window.addEventListener('beforeunload', () => {
      stopAnimation = true;
    });
  }
}
