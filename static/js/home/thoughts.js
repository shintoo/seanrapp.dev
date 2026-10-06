// Blog posts as planets orbiting a nav star.
// Post data is read from thoughts/index.html (written there by thoughts/build.py).

const ORBIT_SCALE  = 8;      // turns the old page's semiMajorAxis (fraction of screen) into world units
const PLANET_SCALE = 0.008;  // turns the old page's pixel size into a world radius
const SPEED_SCALE  = 0.15;   // turns the old page's speed into radians per second
const CAM_DIST     = 5.5;
const CAM_ELEV     = 0.38;   // radians above the orbital plane
const CAM_SPEED    = 0.03;   // radians per second
const FOCUS_DIST   = 5;      // camera distance from a focused planet, in planet radii
const FOCUS_SWING  = 0.6;    // radians off the planet-star line, so we see a lit crescent-to-half
const FOCUS_SPEED  = 0.01;   // slow drift around a focused planet

export function createThoughts({ THREE, scene, canvas, hoverLabel, navigate }, starPos) {
  const sys = { reveal: 0, clusterFade: 0.6, focus: null };

  const group = new THREE.Group();
  group.position.copy(starPos);
  group.visible = false;
  scene.add(group);

  // The star lights the planets; a little ambient keeps their night sides from going pure black
  group.add(new THREE.PointLight(0xfff6ea, 1.6, 0));
  group.add(new THREE.AmbientLight(0xffffff, 0.3));

  const planets = [];
  const hitTargets = [];
  const fadeables = [];

  function addPlanet(article) {
    const radius = article.semiMajorAxis * ORBIT_SCALE;

    // Each orbit gets a slight random tilt so the system reads as 3D
    const pivot = new THREE.Group();
    pivot.rotation.x = (Math.random() - 0.5) * 0.25;
    pivot.rotation.z = (Math.random() - 0.5) * 0.25;
    group.add(pivot);

    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0, depthWrite: false });
    pivot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat));
    fadeables.push({ m: orbitMat, max: 0.35 });

    const planetMat = new THREE.MeshStandardMaterial({
      color: article.color, roughness: 1, metalness: 0, transparent: true, opacity: 0,
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(article.size * PLANET_SCALE, 32, 32), planetMat);
    pivot.add(planet);
    fadeables.push({ m: planetMat, max: 1 });

    // Generous invisible target so small planets are easy to click
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(article.size * PLANET_SCALE * 2.5, 0.12), 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    planet.add(hit);
    hit.userData.article = article;
    hitTargets.push(hit);

    // e.g. '/thoughts/stereo.html' -> 'stereo', used in the homepage's #thoughts/stereo
    const key = article.href.split('/').pop().replace(/\.html$/, '');
    planets.push({
      key, article, planet, radius,
      size: article.size * PLANET_SCALE,
      angle: Math.random() * Math.PI * 2,
      speed: article.speed * SPEED_SCALE,
    });
  }

  sys.ready = fetch('/thoughts/index.html')
    .then(r => r.text())
    .then(html => {
      const m = html.match(/\/\/ posts:start[^\n]*\n\s*const articles = (\[[\s\S]*?\]);\s*\n\s*\/\/ posts:end/);
      if (!m) throw new Error('posts block not found');
      JSON.parse(m[1]).forEach(addPlanet);
      sys.setReveal(sys.reveal);
    })
    .catch(err => console.error('Could not load posts:', err));

  // ---- Camera -----------------------------------------------------------
  let camAngle = 2.2;
  const center = starPos.clone();

  sys.prepare = (incomingDir) => {
    camAngle = Math.atan2(incomingDir.z, incomingDir.x);
  };

  // Focusing a planet freezes it in its orbit, so the camera can settle beside it
  let focusDrift = 0;
  const byKey = (key) => planets.find(p => p.key === key);
  sys.hasFocus = (key) => !!byKey(key);
  sys.setFocus = (key) => {
    if (key !== sys.focus) focusDrift = 0;
    sys.focus = byKey(key) ? key : null;
  };

  const UP = new THREE.Vector3(0, 1, 0);
  const place = (p) => p.planet.position.set(Math.cos(p.angle) * p.radius, 0, Math.sin(p.angle) * p.radius);

  function focusPose(p) {
    place(p);
    p.planet.updateWorldMatrix(true, false);
    const at = p.planet.getWorldPosition(new THREE.Vector3());
    const dir = center.clone().sub(at).normalize()
      .applyAxisAngle(UP, FOCUS_SWING + focusDrift)
      .addScaledVector(UP, 0.25)
      .normalize();
    return { pos: at.clone().addScaledVector(dir, p.size * FOCUS_DIST), look: at };
  }

  sys.restPose = (focus = sys.focus) => byKey(focus) ? focusPose(byKey(focus)) : orbitPose();

  const orbitPose = () => ({
    pos: new THREE.Vector3(
      Math.cos(camAngle) * Math.cos(CAM_ELEV),
      Math.sin(CAM_ELEV),
      Math.sin(camAngle) * Math.cos(CAM_ELEV)
    ).multiplyScalar(CAM_DIST).add(center),
    look: center.clone(),
  });

  sys.pose = (dt) => {
    if (sys.focus) focusDrift += FOCUS_SPEED * dt;
    else camAngle += CAM_SPEED * dt;
    return sys.restPose();
  };

  sys.panelUrl = (focus = sys.focus) => byKey(focus)?.article.href ?? null;

  sys.setReveal = (k) => {
    group.visible = k > 0.001;
    fadeables.forEach(f => { f.m.opacity = f.max * k; });
  };

  // ---- Interaction ------------------------------------------------------
  sys.activate = () => {};

  sys.deactivate = () => {
    hoverLabel.classList.remove('visible');
    canvas.style.cursor = '';
  };

  sys.onPointerMove = (e, raycaster) => {
    const hits = raycaster.intersectObjects(hitTargets);
    if (hits.length) {
      const article = hits[0].object.userData.article;
      hoverLabel.textContent = byKey(sys.focus)?.article === article ? 'Return' : article.title;
      hoverLabel.style.left = e.clientX + 14 + 'px';
      hoverLabel.style.top = e.clientY - 14 + 'px';
      hoverLabel.classList.add('visible');
      canvas.style.cursor = 'pointer';
    } else {
      hoverLabel.classList.remove('visible');
      canvas.style.cursor = '';
    }
  };

  sys.onClick = (e, raycaster) => {
    const hits = raycaster.intersectObjects(hitTargets);
    if (!hits.length) return;
    const p = planets.find(p => p.article === hits[0].object.userData.article);
    navigate(p.key === sys.focus ? 'thoughts' : 'thoughts/' + p.key);
  };

  sys.update = (dt) => {
    if (!group.visible) return;
    planets.forEach(p => {
      if (p.key !== sys.focus) p.angle += p.speed * dt;
      place(p);
    });
  };

  return sys;
}
