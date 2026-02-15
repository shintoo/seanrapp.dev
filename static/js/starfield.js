document.addEventListener('DOMContentLoaded', function () {
  let container = document.querySelector('.starfield');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('starfield');
    document.body.prepend(container);
  }

  let W = window.innerWidth;
  let H = window.innerHeight;
  const SYSTEM_COUNT = 120;
  const G = 5;
  const DAMPING = 0.998;
  const SOFT_MIN = 20;
  const MAX_SPEED = 2.5;
  const DT = .15;
  const SPREAD = 100;

  const systems = [];

  for (let s = 0; s < SYSTEM_COUNT; s++) {
    const cx = Math.random() * W;
    const cy = Math.random() * H;
    const count = 1 + Math.floor(Math.random() * 3);
    const system = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.classList.add('star');
      const size = 1 + Math.random() * 2;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.opacity = 0.4 + Math.random() * 0.6;
      container.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const r = count === 1 ? 0 : (SPREAD * 0.4 + Math.random() * SPREAD * 0.6);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      let vx = 0, vy = 0;
      if (count > 1) {
        vx = -Math.sin(angle) * 0.3;
        vy = Math.cos(angle) * 0.3;
      }

      const star = { el, mass: size, x, y, vx, vy };
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      system.push(star);
    }

    systems.push(system);
  }

  function simulate() {
    for (let s = 0; s < systems.length; s++) {
      const sys = systems[s];
      const len = sys.length;

      for (let i = 0; i < len; i++) {
        const a = sys[i];
        for (let j = i + 1; j < len; j++) {
          const b = sys[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy + SOFT_MIN * SOFT_MIN;
          const dist = Math.sqrt(distSq);
          const force = G * a.mass * b.mass / distSq;
          const fx = force * dx / dist;
          const fy = force * dy / dist;

          a.vx += fx / a.mass * DT;
          a.vy += fy / a.mass * DT;
          b.vx -= fx / b.mass * DT;
          b.vy -= fy / b.mass * DT;
        }
      }

      for (let i = 0; i < len; i++) {
        const star = sys[i];

        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        if (speed > MAX_SPEED) {
          star.vx = (star.vx / speed) * MAX_SPEED;
          star.vy = (star.vy / speed) * MAX_SPEED;
        }

        star.vx *= DAMPING;
        star.vy *= DAMPING;

        star.x += star.vx * DT;
        star.y += star.vy * DT;

        if (star.x < -10) star.x += W + 20;
        else if (star.x > W + 10) star.x -= W + 20;
        if (star.y < -10) star.y += H + 20;
        else if (star.y > H + 10) star.y -= H + 20;

        star.el.style.left = star.x + 'px';
        star.el.style.top = star.y + 'px';
      }
    }

    requestAnimationFrame(simulate);
  }

  requestAnimationFrame(simulate);

  window.addEventListener('resize', () => {
    const newW = window.innerWidth;
    const newH = window.innerHeight;
    systems.forEach(sys => sys.forEach(star => {
      star.x = star.x / W * newW;
      star.y = star.y / H * newH;
    }));
    W = newW;
    H = newH;
  });
});
