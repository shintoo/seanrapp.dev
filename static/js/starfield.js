document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.starfield');
  if (!container) return;

  // If canvas already exists, don't recreate
  if (container.querySelector('canvas')) return;

  /* ── Configurable constants ─────────────────────────────── */
  const YEARS_PER_SECOND = 1000;
  const BASE_STAR_RADIUS = 2.0;

  /* ── Projection center: Summer Triangle centroid ────────── */
  const CENTER_RA  = 296.25;  // degrees
  const CENTER_DEC = 30.9;    // degrees
  const FOV_DEG    = 120;      // horizontal field of view in degrees

  /* ── Convert degrees to radians ─────────────────────────── */
  const DEG = Math.PI / 180;
  const centerRA  = CENTER_RA  * DEG;
  const centerDec = CENTER_DEC * DEG;
  const sinDec0 = Math.sin(centerDec);
  const cosDec0 = Math.cos(centerDec);

  /* ── Canvas setup ───────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, scale;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    // scale: pixels per radian so that FOV_DEG fills the width
    scale = W / (2 * Math.tan(FOV_DEG / 2 * DEG));
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Star color from bp_rp color index ──────────────────── */
  function starColor(bpRp) {
    // bp_rp ranges roughly -0.5 (hot blue) to 4+ (cool red)
    // Map to approximate RGB
    if (bpRp == null) return [255, 255, 255];
    const t = Math.max(-0.5, Math.min(4.0, bpRp));
    let r, g, b;
    if (t < 0.0) {
      // blue-white
      r = 155 + (t + 0.5) * 200;
      g = 175 + (t + 0.5) * 160;
      b = 255;
    } else if (t < 0.5) {
      // white
      r = 255;
      g = 255 - t * 30;
      b = 255 - t * 40;
    } else if (t < 1.5) {
      // white to yellow
      const f = (t - 0.5) / 1.0;
      r = 255;
      g = 240 - f * 50;
      b = 235 - f * 120;
    } else if (t < 2.5) {
      // yellow to orange
      const f = (t - 1.5) / 1.0;
      r = 255;
      g = 190 - f * 60;
      b = 115 - f * 60;
    } else {
      // orange to red
      const f = (t - 2.5) / 1.5;
      r = 255;
      g = 130 - f * 60;
      b = 55 - f * 40;
    }
    return [Math.round(Math.max(0, Math.min(255, r))),
            Math.round(Math.max(0, Math.min(255, g))),
            Math.round(Math.max(0, Math.min(255, b)))];
  }

  /* ── Magnitude to visual size and brightness ────────────── */
  function magToRadius(mag) {
    // Brighter stars (lower mag) get larger radius
    // Vega (0.03) -> ~3.5px, mag 5 -> ~1px
    return BASE_STAR_RADIUS * Math.pow(10, (3.0 - mag) / 5.0);
  }
  function magToAlpha(mag) {
    // Brighter = more opaque
    // mag 0 -> 1.0, mag 5 -> ~0.35
    return Math.max(0.1, Math.min(1.0, Math.pow(10, (6 - mag) / 6.0)));
  }

  /* ── Gnomonic projection: RA/Dec -> canvas x,y ──────────── */
  function project(ra, dec) {
    const raRad  = ra  * DEG;
    const decRad = dec * DEG;
    const sinDec = Math.sin(decRad);
    const cosDec = Math.cos(decRad);
    const dRA = raRad - centerRA;
    const cosDRA = Math.cos(dRA);

    const cosc = sinDec0 * sinDec + cosDec0 * cosDec * cosDRA;
    if (cosc <= 0) return null; // behind the viewer

    const x = (cosDec * Math.sin(dRA)) / cosc;
    const y = (cosDec0 * sinDec - sinDec0 * cosDec * cosDRA) / cosc;

    // Note: RA increases eastward, but on-screen east is left,
    // so we negate x to match sky orientation (east-left)
    return {
      px: W / 2 - x * scale,
      py: H / 2 - y * scale,
    };
  }

  /* ── Expose projection for homepage star-links ──────────── */
  window.gaiaProject = project;

  /* ── Load and render stars ──────────────────────────────── */
  let stars = null;
  let startTime = null;

  fetch('/static/data/stars.json')
    .then(r => r.json())
    .then(data => {
      stars = data.map(s => {
        const [r, g, b] = starColor(s.bp_rp);
        return {
          ra0:    s.ra,
          dec0:   s.dec,
          ra:     s.ra,
          dec:    s.dec,
          mag:    s.mag,
          pmra:   s.pmra,    // mas/yr
          pmdec:  s.pmdec,   // mas/yr
          radius: magToRadius(s.mag),
          alpha:  magToAlpha(s.mag),
          color:  `${r},${g},${b}`,
          sourceId: s.source_id,
        };
      });
      startTime = performance.now();
      requestAnimationFrame(render);

      // Signal that projection is ready (for homepage positioning)
      window.dispatchEvent(new Event('starfield-ready'));
    });

  function render(now) {
    if (!stars) return;

    const elapsed = (now - startTime) / 1000; // seconds
    const years = elapsed * YEARS_PER_SECOND;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Update position with proper motion
      // pmra is in mas/yr along RA (includes cos(dec) factor from Gaia)
      // pmdec is in mas/yr along Dec
      const masToDegs = 1 / 3600000;
      s.ra  = s.ra0  + s.pmra  * years * masToDegs / Math.cos(s.dec0 * DEG);
      s.dec = s.dec0 + s.pmdec * years * masToDegs;

      const p = project(s.ra, s.dec);
      if (!p) continue;
      if (p.px < -20 || p.px > W + 20 || p.py < -20 || p.py > H + 20) continue;

      const r = s.radius;

      // Draw glow for brighter stars
      if (r > 1.5) {
        const gradient = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 3);
        gradient.addColorStop(0, `rgba(${s.color},${s.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${s.color},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw star core
      ctx.fillStyle = `rgba(${s.color},${s.alpha})`;
      ctx.beginPath();
      ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }
});
