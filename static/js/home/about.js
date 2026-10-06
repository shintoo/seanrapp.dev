// Deneb has no planets: up close, the star itself is the backdrop for the about panel.

const CAM_DIST  = 7;
const GLOW_SIZE = 3.2;    // world units across
const CAM_SPEED = 0.015;  // radians per second, a slow drift around the star

export function createAbout({ THREE, scene }, starPos) {
  const sys = { reveal: 0, clusterFade: 0.8 };

  // Soft radial glow, layered on top of the nav star's own point
  const tex = document.createElement('canvas');
  tex.width = tex.height = 128;
  const g = tex.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0,    'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.08, 'rgba(240, 244, 255, 0.8)');
  grad.addColorStop(0.3,  'rgba(200, 215, 255, 0.22)');
  grad.addColorStop(1,    'rgba(200, 215, 255, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);

  const glowMat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(tex),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.position.copy(starPos);
  glow.scale.setScalar(GLOW_SIZE);
  glow.visible = false;
  scene.add(glow);

  const UP = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3(1, 0, 0);
  let drift = 0;

  sys.prepare = (incomingDir) => {
    dir.copy(incomingDir);
    drift = 0;
  };

  sys.restPose = () => ({
    pos: dir.clone().applyAxisAngle(UP, drift).multiplyScalar(CAM_DIST).add(starPos),
    look: starPos.clone(),
  });

  sys.pose = (dt) => {
    drift += CAM_SPEED * dt;
    return sys.restPose();
  };

  sys.setReveal = (k) => {
    glow.visible = k > 0.001;
    glowMat.opacity = k;
  };

  sys.panelUrl = () => '/about.html';

  sys.activate = () => {};
  sys.deactivate = () => {};
  sys.update = (dt, t) => {
    if (glow.visible) glow.scale.setScalar(GLOW_SIZE * (1 + 0.03 * Math.sin(t * 0.8)));
  };

  return sys;
}
