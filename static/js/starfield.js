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
  let rotationAngle = 0;
  const rotationSpeed = 0.0002; // Slow rotation speed (radians per frame)

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  };

  const initStars = () => {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < numStars; i++) {
      // Store stars in spherical coordinates
      // longitude: horizontal angle around the dome (0 to 2π)
      // latitude: vertical angle from horizon (0 = horizon, π/2 = zenith/top)
      const longitude = Math.random() * Math.PI * 2;
      const latitude = Math.random() * Math.PI / 2; // 0 to 90 degrees

      stars.push({
        longitude: longitude,
        latitude: latitude,
        y: Math.random() * canvas.height, // Fixed vertical position
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.1 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update rotation angle
    rotationAngle += rotationSpeed;

    stars.forEach(star => {
      // Calculate current longitude with rotation
      const currentLongitude = star.longitude + rotationAngle;

      // Normalize angle to -π to π range for visibility check
      const normalizedLongitude = ((currentLongitude + Math.PI) % (Math.PI * 2)) - Math.PI;

      // Only render stars in front of the viewer (between -π/2 and π/2)
      if (normalizedLongitude < -Math.PI / 2 || normalizedLongitude > Math.PI / 2) {
        return; // Skip stars behind the viewer
      }

      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.6 + 1;
      const currentOpacity = star.opacity * twinkle;

      // Project 3D position onto 2D screen
      // The closer to the horizon (latitude near 0), the wider the circular path
      // The closer to zenith (latitude near π/2), the smaller the circular path
      const horizontalRadius = Math.cos(star.latitude) * canvas.width * 0.6;
      const x = canvas.width / 2 + Math.sin(currentLongitude) * horizontalRadius;
      const y = star.y;

      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
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
