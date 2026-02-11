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
  const updateSpot = (x, y) => {
    hero.style.setProperty('--spot-x', `${x}%`);
    hero.style.setProperty('--spot-y', `${y}%`);
  };

  const handleMove = (event) => {
    const rect = hero.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    updateSpot(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  hero.addEventListener('mousemove', handleMove);
  hero.addEventListener('touchmove', handleMove, { passive: true });
  updateSpot(65, 35);
}
