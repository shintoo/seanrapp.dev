import * as THREE from 'three';
import { createAdventures } from '/static/js/home/adventures.js';
import { createThoughts } from '/static/js/home/thoughts.js';
import { createAbout } from '/static/js/home/about.js';

// ---- Tunables ---------------------------------------------------------
const STAR_COUNT     = 1500;
const FIELD_RADIUS   = 50;     // rough size of the star cluster (soft edged)
const ORBIT_RADIUS   = 200;    // camera circles the cluster from outside, at this distance
const ORBIT_SPEED    = 0.112;  // radians per second
const HOVER_SLOWDOWN = 0.5;    // orbit speed multiplier while hovering a link
const MOUSE_SWAY     = 2;      // how far the camera leans toward the mouse
const MAX_POINT_PX   = 22;     // caps how big a star can get up close

const TILT_SECS      = 1.2;    // turn to face the clicked star (overlaps the start of the flight)
const IN_SECS        = 3.4;    // fly straight in to its system
const OUT_SECS       = 3.0;    // fly back out to the home orbit
const FOCUS_SECS     = 2.6;    // fly between a system and one of its planets
const PANEL_WIDE     = 799;    // at this window width and up, the reading panel sits to the side

// The Summer Triangle, placed as a loose triangle near the middle of the scene.
// `system` names the scene the camera flies into; stars without one are plain links.
const NAV_STARS = [
  { id: 'star-adventures', name: 'Vega',   pos: [-20,  22,  -8], color: '#cfe0ff', size: 10.0, system: 'adventures' },
  { id: 'star-thoughts',   name: 'Altair', pos: [ 10, -20,  12], color: '#f4f2ff', size: 9.5,  system: 'thoughts' },
  { id: 'star-about',      name: 'Deneb',  pos: [ 26,  15, -18], color: '#e6edff', size: 9.0,  system: 'about' },
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Renderer / scene -------------------------------------------------
const canvas = document.getElementById('space');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);

// ---- Star appearance --------------------------------------------------
// A rough blackbody-ish palette, weighted toward white/yellow like a real sky
const PALETTE = [
  { c: '#9bb0ff', w: 0.06 },
  { c: '#aabfff', w: 0.10 },
  { c: '#cad7ff', w: 0.16 },
  { c: '#f8f7ff', w: 0.24 },
  { c: '#fff4ea', w: 0.20 },
  { c: '#ffd2a1', w: 0.15 },
  { c: '#ffb56c', w: 0.09 },
];
const paletteTotal = PALETTE.reduce((s, p) => s + p.w, 0);
function randomStarColor() {
  let r = Math.random() * paletteTotal;
  for (const p of PALETTE) { if ((r -= p.w) <= 0) return new THREE.Color(p.c); }
  return new THREE.Color(PALETTE[0].c);
}

const vertexShader = `
  attribute float size;
  attribute float phase;
  attribute float alpha;
  attribute vec3 color;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMaxPx;
  uniform float uFade;
  uniform float uNearFade;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;

    // Far stars keep a minimum sprite size but get dimmer instead of vanishing
    float apparent = size * (300.0 / dist);
    float px = clamp(apparent * 3.0, 4.0, uMaxPx) * uPixelRatio;
    float bright = clamp(apparent / 2.5, 0.25, 1.0);

    // Subtle twinkle
    float tw = 0.85 + 0.15 * sin(uTime * (0.6 + fract(phase * 7.13) * 1.6) + phase * 6.2831);

    // Fade stars that are extremely close to the camera, and very distant ones a little
    float nearFade = mix(1.0, smoothstep(4.0, 20.0, dist), uNearFade);
    float farFade  = 1.0 - 0.5 * smoothstep(300.0, 700.0, dist);

    vColor = color;
    vAlpha = tw * nearFade * farFade * bright * alpha * uFade;
    gl_PointSize = px;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  uniform float uGlow;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;           // 0 at center, 1 at edge
    if (r > 1.0) discard;

    float core = exp(-r * r * 18.0);       // tight bright center
    float halo = exp(-r * 5.0) * 0.35 * uGlow;     // short soft glow
    float edge = 1.0 - smoothstep(0.7, 1.0, r);
    float a = (core + halo) * edge * vAlpha;

    // Push the very center toward white so stars read as hot points
    vec3 col = mix(vColor, vec3(1.0), core * 0.6);
    gl_FragColor = vec4(col * a, a);
  }
`;

function makeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uMaxPx:      { value: MAX_POINT_PX },
      uGlow:       { value: 1 },
      uFade:       { value: 1 },
      uNearFade:   { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function gaussian() {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

function pointsGeometry(positions, colors, sizes) {
  const n = sizes.length;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('phase',    new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));
  geo.setAttribute('alpha',    new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
  return geo;
}

// ---- Background stars -------------------------------------------------
const bgMaterial = makeMaterial();
{
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors    = new Float32Array(STAR_COUNT * 3);
  const sizes     = new Float32Array(STAR_COUNT);

  const v = new THREE.Vector3();
  for (let i = 0; i < STAR_COUNT; i++) {
    // Gaussian cloud: dense in the middle, thinning out so there's no hard edge
    do {
      v.set(gaussian(), gaussian(), gaussian()).multiplyScalar(FIELD_RADIUS / 2.2);
    } while (v.length() > FIELD_RADIUS * 1.6);
    positions.set([v.x, v.y, v.z], i * 3);

    const c = randomStarColor();
    colors.set([c.r, c.g, c.b], i * 3);

    // Power-law brightness: lots of faint stars, a few bright ones
    sizes[i] = 0.5 + Math.pow(Math.random(), 6) * 3.0;
  }
  scene.add(new THREE.Points(pointsGeometry(positions, colors, sizes), bgMaterial));
}

// ---- Navigation stars -------------------------------------------------
const navMaterial = makeMaterial();
navMaterial.uniforms.uMaxPx.value = 52;
navMaterial.uniforms.uGlow.value = 3.0;
// Nav stars double as the "suns" of their systems, so they must not fade up close
navMaterial.uniforms.uNearFade.value = 0;

const navGeo = (() => {
  const positions = new Float32Array(NAV_STARS.length * 3);
  const colors    = new Float32Array(NAV_STARS.length * 3);
  const sizes     = new Float32Array(NAV_STARS.length);
  NAV_STARS.forEach((s, i) => {
    positions.set(s.pos, i * 3);
    const c = new THREE.Color(s.color);
    colors.set([c.r, c.g, c.b], i * 3);
    sizes[i] = s.size;
    s.vec = new THREE.Vector3(...s.pos);
    s.el = document.getElementById(s.id);
    s.tooltip = s.el.querySelector('.tooltip');
    s.label = s.tooltip.textContent.trim();
    s.el.setAttribute('aria-label', s.label);
  });
  return pointsGeometry(positions, colors, sizes);
})();
scene.add(new THREE.Points(navGeo, navMaterial));
const navSizeAttr  = navGeo.getAttribute('size');
const navAlphaAttr = navGeo.getAttribute('alpha');

// ---- Destination systems ----------------------------------------------
const hoverLabel = document.getElementById('hover-label');
const ctx = { THREE, scene, camera, renderer, canvas, hoverLabel, navigate: (r) => go(r) };
const systems = {};
NAV_STARS.forEach((s, i) => {
  if (s.system === 'adventures') systems.adventures = createAdventures(ctx, s.vec);
  if (s.system === 'thoughts')   systems.thoughts   = createThoughts(ctx, s.vec);
  if (s.system === 'about')      systems.about      = createAbout(ctx, s.vec);
  if (s.system) Object.assign(systems[s.system], { name: s.system, star: s, starIndex: i });
});

// ---- Camera poses & flights -------------------------------------------
// A pose is where the camera sits and what it looks at.
const pose = () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
const clonePose = (p) => ({ pos: p.pos.clone(), look: p.look.clone() });
const current = pose();

let angle = 0.6;
let speedMul = 1;
let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;

function homePose(out = pose(), sway = true) {
  // Circle the origin with a gentle up/down drift, leaning toward the mouse
  const y = Math.sin(angle * 0.7) * 25;
  out.pos.set(Math.cos(angle) * ORBIT_RADIUS, y, Math.sin(angle) * ORBIT_RADIUS);
  if (sway) {
    out.pos.x += -Math.sin(angle) * mouseX * MOUSE_SWAY;
    out.pos.z +=  Math.cos(angle) * mouseX * MOUSE_SWAY;
    out.pos.y -= mouseY * MOUSE_SWAY;
  }
  out.look.set(0, 0, 0);
  return out;
}

// Covers most of the distance early, then eases in slowly, so a huge zoom
// range (cluster -> planet) doesn't rush at the end
const ZOOM_K = 5;
const approachFrac = (e) => (1 - Math.exp(-ZOOM_K * e)) / (1 - Math.exp(-ZOOM_K));

const easeSine = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);
const _from = new THREE.Vector3(), _to = new THREE.Vector3(), _dir = new THREE.Vector3();
function slerpDir(a, b, t, out) {
  const th = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  if (th < 1e-4) return out.copy(b);
  const s = Math.sin(th);
  return out.copy(a).multiplyScalar(Math.sin((1 - t) * th) / s).addScaledVector(b, Math.sin(t * th) / s);
}
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const smoothstep = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Each segment's start (A) and end (B) are captured when it begins, so
// segments chain correctly even when a flight is redirected midway.
const SEGMENT_KINDS = {
  // Straight line toward B, slowing as it gets close. The camera turns to
  // face seg.turnLook during the first TILT_SECS, then settles onto B.look.
  in: (A, B, e, out, seg) => {
    const turn = easeSine(Math.min(seg.elapsed / (TILT_SECS * durScale), 1));
    out.pos.copy(A.pos).lerp(B.pos, approachFrac(e));
    // Turn by angle rather than by sliding the look point, so rotation speed
    // rises and falls evenly instead of whipping around as we close in
    _from.copy(A.look).sub(A.pos).normalize();
    _to.copy(seg.turnLook).sub(out.pos);
    const dist = _to.length();
    slerpDir(_from, _to.divideScalar(dist), turn, _dir);
    out.look.copy(out.pos).addScaledVector(_dir, dist).lerp(B.look, smoothstep(0.5, 1, e));
  },
  // Straight line away, starting slow and speeding up
  out: (A, B, e, out) => {
    const f = 1 - approachFrac(1 - e);
    out.pos.copy(A.pos).lerp(B.pos, f);
    out.look.copy(A.look).lerp(B.look, f);
  },
};

let mode = 'home';     // 'home' | 'flight' | 'system'
let active = null;     // the system the camera is in (or flying to/from)
let flight = null;
let hovered = null;

function setReveal(sys, k) {
  sys.reveal = k;
  sys.setReveal(k);
}

function startFlight(segs, onDone) {
  hideLinks();
  if (active && mode === 'system') active.deactivate();
  mode = 'flight';
  flight = { segs, i: 0, t: 0, onDone };
}

function stepFlight(dt) {
  const seg = flight.segs[flight.i];
  if (flight.t === 0) {
    seg.A = clonePose(current);
    seg.B = seg.target();
  }
  flight.t += dt;
  const u = Math.min(flight.t / seg.dur, 1);
  const e = easeInOut(u);
  seg.elapsed = flight.t;
  SEGMENT_KINDS[seg.kind](seg.A, seg.B, e, current, seg);
  seg.onStep?.(e);
  if (u >= 1) {
    flight.i++;
    flight.t = 0;
    if (flight.i >= flight.segs.length) {
      const done = flight.onDone;
      flight = null;
      done();
    }
  }
}

const durScale = reduceMotion ? 0.5 : 1;

// Back straight out of whichever system is showing, to the home orbit
function exitSegment() {
  const shown = Object.values(systems).find(s => s.reveal > 0);
  const r0 = shown ? shown.reveal : 0;
  return {
    kind: 'out',
    dur: OUT_SECS * durScale,
    target: () => homePose(pose(), false),
    onStep: e => { if (shown) setReveal(shown, r0 * (1 - smoothstep(0, 0.5, e))); },
  };
}

// Fly into a system, or to one of its planets (`focus`), or back out from a planet
function flyTo(sys, focus = null, instant = false) {
  if (instant) {
    sys.prepare(homePose(pose(), false).pos.sub(sys.star.vec).normalize());
    sys.setFocus?.(focus);
    setReveal(sys, 1);
    Object.assign(current, clonePose(sys.restPose()));
    active = sys;
    arrive();
    return;
  }
  const inside = active === sys && mode !== 'home';
  const segs = [];
  if (active && active !== sys) segs.push(exitSegment());
  let rStart = 0;
  const seg = {
    kind: inside && sys.focus && !focus ? 'out' : 'in',
    dur: (inside ? FOCUS_SECS : IN_SECS) * durScale,
    turnLook: sys.star.vec.clone(),
    target: () => {
      // Turn the system to face the way we came in, so the flight is a straight line
      if (!sys.reveal) sys.prepare(current.pos.clone().sub(sys.star.vec).normalize());
      // Freeze the planet now, so it's still there when we arrive
      if (focus) sys.setFocus(focus);
      rStart = sys.reveal;
      const B = clonePose(sys.restPose(focus));
      if (focus) seg.turnLook.copy(B.look);
      return B;
    },
    onStep: e => setReveal(sys, rStart + (1 - rStart) * smoothstep(0.35, 1, e)),
  };
  segs.push(seg);
  startFlight(segs, () => { sys.setFocus?.(focus); arrive(); });
  active = sys;
}

function arrive() {
  mode = 'system';
  active.activate();
  if (active.panelUrl?.()) openPanel(active.panelUrl());
}

function exitToHome() {
  if (mode === 'home') return;
  startFlight([exitSegment()], () => { active.setFocus?.(null); mode = 'home'; active = null; });
}

// ---- Reading panel (about page and blog posts) ------------------------
// The real pages load in a frame, so their own styles and scripts keep working
const reader = document.getElementById('reader');
const readerFrame = document.getElementById('reader-frame');
let panelOpen = false;

function loadPanel(url) {
  if (readerFrame.getAttribute('src') !== url) readerFrame.src = url;
}

function openPanel(url) {
  loadPanel(url);
  panelOpen = true;
  reader.classList.add('open');
  reader.setAttribute('aria-hidden', 'false');
}

function closePanel() {
  hidePreview();
  panelOpen = false;
  reader.classList.remove('open');
  reader.setAttribute('aria-hidden', 'true');
}

// Close goes up one level: a post back to its planets, about back home
function closeCurrent() {
  const [name, sub] = location.hash.slice(1).split('/');
  go(sub ? name : '');
}

document.getElementById('reader-close').addEventListener('click', closeCurrent);

// Gallery previews hovered inside the panel; the frame sends positions in its own coordinates
const preview = document.getElementById('preview');
const hidePreview = () => preview.classList.remove('visible');

function showPreview(src, caption) {
  preview.querySelector('img').src = src;
  document.getElementById('preview-caption').textContent = caption;
  preview.classList.add('visible');
}

function movePreview(x, y) {
  const frame = readerFrame.getBoundingClientRect();
  const cx = frame.left + x;
  const width = preview.offsetWidth;
  const fitsRight = cx + 15 + width <= window.innerWidth;
  preview.style.left = (fitsRight ? cx + 15 : Math.max(0, cx - 15 - width)) + 'px';
  preview.style.top = (frame.top + y - 200) + 'px';
}

// Links clicked inside the panel come here, so they fly the camera instead of leaving the page
const PATH_ROUTES = {
  '/': '', '/index.html': '',
  '/about.html': 'about', '/thoughts/index.html': 'thoughts', '/adventures/index.html': 'adventures',
};
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || e.source !== readerFrame.contentWindow) return;
  if (e.data?.type === 'close') closeCurrent();
  if (e.data?.type === 'preview-show') showPreview(e.data.src, e.data.caption);
  if (e.data?.type === 'preview-move') movePreview(e.data.x, e.data.y);
  if (e.data?.type === 'preview-hide') hidePreview();
  if (e.data?.type !== 'site-nav') return;
  const path = e.data.path;
  const post = path.match(/^\/thoughts\/([^/]+)\.html$/);
  if (path in PATH_ROUTES) go(PATH_ROUTES[path]);
  else if (post && systems.thoughts.hasFocus(post[1])) go('thoughts/' + post[1]);
  else window.location.href = path;
});

// How far the scene slides left so its subject stays visible beside the panel
let viewShift = 0;
function updateViewShift(dt) {
  const target = panelOpen && window.innerWidth >= PANEL_WIDE ? reader.offsetWidth / 2 : 0;
  viewShift += (target - viewShift) * (1 - Math.exp(-4 * dt));
  if (viewShift > 0.5) {
    camera.setViewOffset(window.innerWidth, window.innerHeight, viewShift, 0, window.innerWidth, window.innerHeight);
  } else if (camera.view) {
    camera.clearViewOffset();
  }
}

// ---- Routing (URL hash keeps the back button working) -----------------
// e.g. #adventures, #about, #thoughts, #thoughts/stereo
function route(instant = false) {
  const [name, sub = null] = location.hash.slice(1).split('/');
  const sys = systems[name];
  if (!sys) {
    closePanel();
    exitToHome();
    return;
  }
  const focus = sys.hasFocus?.(sub) ? sub : null;
  const settled = active === sys && mode === 'system' && (sys.focus ?? null) === focus;
  if (settled) return;
  closePanel();
  // Start loading the page during the flight, so the panel isn't blank when it opens
  const url = sys.panelUrl?.(focus);
  if (url) loadPanel(url);
  flyTo(sys, focus, instant);
}

function go(name) {
  history.pushState(null, '', name ? '#' + name : location.pathname);
  route();
}

window.addEventListener('popstate', () => route());

// ---- Links over the stars ---------------------------------------------
function hideLinks() {
  NAV_STARS.forEach(s => { s.el.style.visibility = 'hidden'; });
  hovered = null;
}

NAV_STARS.forEach((s, i) => {
  s.el.addEventListener('mouseenter', () => { hovered = i; });
  s.el.addEventListener('mouseleave', () => { if (hovered === i) hovered = null; });
  s.el.addEventListener('focus',      () => { hovered = i; });
  s.el.addEventListener('blur',       () => { if (hovered === i) hovered = null; });
  s.el.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (mode === 'system' && active?.star === s) { e.preventDefault(); go(''); return; }
    if (mode === 'home' && s.system) { e.preventDefault(); go(s.system); }
  });
});

function updateLinks() {
  const projected = new THREE.Vector3();
  NAV_STARS.forEach((s) => {
    // At home every star is a link; inside a system only its sun is, and it leads back out
    const show = mode === 'home' || (mode === 'system' && active?.star === s);
    s.tooltip.textContent = mode === 'system' ? 'home' : s.label;
    projected.copy(s.vec).project(camera);
    const onScreen = projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1;
    const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    s.el.style.transform = `translate(${sx}px, ${sy}px)`;
    s.el.style.visibility = show && onScreen ? 'visible' : 'hidden';
  });
}

// ---- Pointer input ----------------------------------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function castFrom(e) {
  ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  return raycaster;
}

window.addEventListener('pointermove', (e) => {
  targetMX = (e.clientX / window.innerWidth  - 0.5) * 2;
  targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
  if (mode === 'system') active.onPointerMove?.(e, castFrom(e));
});
canvas.addEventListener('pointerdown', (e) => { if (mode === 'system') active.onPointerDown?.(e); });
window.addEventListener('pointerup',   (e) => { if (mode === 'system') active.onPointerUp?.(e); });
canvas.addEventListener('click',       (e) => { if (mode === 'system') active.onClick?.(e, castFrom(e)); });
canvas.addEventListener('wheel', (e) => {
  if (mode === 'system' && active.onWheel) { e.preventDefault(); active.onWheel(e); }
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || mode !== 'system') return;
  if (panelOpen) { closeCurrent(); return; }
  if (active.onEscape?.()) return;  // e.g. closed a modal instead
  go('');
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Animation loop ---------------------------------------------------
const clock = new THREE.Clock();
const starMaterials = [bgMaterial, navMaterial];

function tick() {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  mouseX += (targetMX - mouseX) * 0.04;
  mouseY += (targetMY - mouseY) * 0.04;

  if (mode === 'home') {
    // Ease the orbit speed down while a link is hovered
    const targetMul = (hovered !== null ? HOVER_SLOWDOWN : 1) * (reduceMotion ? 0.2 : 1);
    speedMul += (targetMul - speedMul) * 0.05;
    angle += ORBIT_SPEED * speedMul * dt;
    homePose(current);
  } else if (mode === 'flight') {
    stepFlight(dt);
  } else {
    Object.assign(current, active.pose(dt));
  }

  updateViewShift(dt);
  camera.position.copy(current.pos);
  camera.lookAt(current.look);
  // Keep depth precision usable from cluster scale down to planet scale
  camera.near = THREE.MathUtils.clamp(current.pos.distanceTo(current.look) * 0.01, 0.0005, 0.5);
  camera.updateProjectionMatrix();

  Object.values(systems).forEach(s => s.update(dt, t, camera));

  // Systems can dim the cluster (e.g. adventures swaps it for the galaxy backdrop)
  const shown = Object.values(systems).find(s => s.reveal > 0);
  const k = shown ? THREE.MathUtils.lerp(1, shown.clusterFade, shown.reveal) : 1;
  bgMaterial.uniforms.uFade.value = k;
  NAV_STARS.forEach((s, i) => {
    navAlphaAttr.array[i] = shown && shown.star !== s ? k : 1;
    const target = s.size * (hovered === i && mode === 'home' ? 1.6 : 1);
    navSizeAttr.array[i] += (target - navSizeAttr.array[i]) * 0.15;
  });
  navAlphaAttr.needsUpdate = true;
  navSizeAttr.needsUpdate = true;

  starMaterials.forEach(m => { m.uniforms.uTime.value = reduceMotion ? 0 : t; });

  renderer.render(scene, camera);
  updateLinks();

  requestAnimationFrame(tick);
}

homePose(current);
// Wait for the post list, so a link straight to #thoughts/<post> can find its planet
Promise.all(Object.values(systems).map(s => s.ready)).finally(() => route(true));
requestAnimationFrame(tick);
