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
  const rotationSpeed = 0.0004; // Slow rotation speed (radians per frame)

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

      // Calculate y position based on latitude
      // Lower latitude (closer to horizon) = middle of screen
      // Higher latitude (closer to zenith) = distributed across screen
      // Use a mapping where latitude determines the vertical distribution
      const normalizedLatitude = latitude / (Math.PI / 2); // 0 to 1
      const yRange = canvas.height * (1 - normalizedLatitude * 0.7); // Stars near zenith have less y variation
      const yOffset = (canvas.height - yRange) / 2;
      const y = yOffset + Math.random() * yRange;

      stars.push({
        longitude: longitude,
        latitude: latitude,
        y: y,
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

      // Project 3D position onto 2D screen
      // The closer to the horizon (latitude near 0), the wider the circular path
      // The closer to zenith (latitude near π/2), the smaller the circular path
      const horizontalRadius = Math.cos(star.latitude) * canvas.width * 0.6;
      const x = canvas.width / 2 + Math.sin(currentLongitude) * horizontalRadius;
      const y = star.y;

      // Check if star is visible on screen (simple bounds check)
      // This prevents stars from disappearing in the middle of the screen
      if (x < -50 || x > canvas.width + 50) {
        return; // Skip stars that are off-screen
      }

      // Calculate depth (z-axis) to determine if star is behind viewer
      // cos(longitude) gives us the forward/backward position
      const z = Math.cos(currentLongitude);
      if (z < 0) {
        return; // Skip stars behind the viewer
      }

      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.6 + 1;
      const currentOpacity = star.opacity * twinkle;

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
