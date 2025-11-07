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
      // Lower latitude (closer to horizon) = "middle" of screen (35% up from bottom of screen)
      // Higher latitude (closer to zenith) = distributed across screen
      // Map latitude (0 to π/2) to vertical position
      // latitude 0 (horizon) -> 0.35 (35% up from bottom)
      // latitude π/2 (zenith) -> 1.1 (beyond top of screen)
      const normalizedLatitude = latitude / (Math.PI / 2); // 0 to 1
      const y = 0.5 + (normalizedLatitude * 0.9); // 0.35 to 0.75

      stars.push({
        longitude: longitude,
        latitude: latitude,
        y: y,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.1 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
        color: [Math.random() * 255, Math.random() * 255, Math.random() * 255]
      });
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update rotation angle - this is the base rotation
    rotationAngle -= rotationSpeed;

    stars.forEach(star => {

      // Calculate rotated longitude (horizontal rotation around the dome)
      const rotatedLongitude = star.longitude + rotationAngle;

      // Project 3D spherical coordinates to 2D screen coordinates
      // Convert spherical to Cartesian coordinates on a hemisphere
      const radius = 1; // Unit sphere radius
      const x3d = radius * Math.cos(star.latitude) * Math.cos(rotatedLongitude);
      const y3d = radius * Math.sin(star.latitude);
      const z3d = radius * Math.cos(star.latitude) * Math.sin(rotatedLongitude);

      // Only render stars in front of the viewer (z >= 0 means facing us)
      if (z3d < 0) return;

      // Project to 2D screen space
      // x3d maps to horizontal position (-1 to 1 -> 0 to canvas.width)
      // y3d maps to vertical position (0 to 1 -> top to middle of screen)
      const x = (x3d + 1) * canvas.width / 2;
      const y = (1 - y3d) * canvas.height * 0.67; // Scale to upper portion of screen

      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.6 + 1;
      const currentOpacity = star.opacity * twinkle;

      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 179, ${currentOpacity})`;
      // ctx.fillStyle = `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, ${currentOpacity})`;
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
