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
}
