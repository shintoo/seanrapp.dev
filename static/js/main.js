// Starfield background
const createStarfield = () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'starfield';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let stars = [];

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  };

  const initStars = () => {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.1 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.6 + 1;
      const currentOpacity = star.opacity * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 179, ${currentOpacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animate();
};

// Initialize starfield when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createStarfield);
} else {
  createStarfield();
}

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.body.classList.add("modal-backdrop");
}

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.classList.remove("modal-backdrop")
}

document.addEventListener("DOMContentLoaded", () => {
  const idx = new Date().getDay()
  const song = [
    {"title": "im the visual - yoo mi", "url":"https://youtu.be/p08l5f3oOSY"},
    { "title": "baddie - ive", "url": "https://youtu.be/Da4P2uT4mVc" },
    { "title": "nuuamm - maho", "url": "https://youtu.be/l5aEgNjU8xQ" },
    { "title": "真昼の月 - noisycell", "url": "https://youtu.be/VTKeRmd90NY" },
    { "title": "cure - honeydip", "url": "https://youtu.be/CljBDaSOr3g" },
    { "title": "btg - kiiikiii", "url": "https://youtu.be/hnCd1RyTaOA" },
    { "title": "life in these islands - kawika kahiapo", "url": "https://youtu.be/ps_8HFp3PyI" },
  ][idx]

  document.getElementById("sotd").innerHTML = `<a href="${song.url}" target="_blank">${song.title}</a>`
})
