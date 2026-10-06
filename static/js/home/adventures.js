// Earth orbiting a nav star, with travel markers and the galaxy as a backdrop.
// Built in the old adventures page's units (Earth radius 1), then shrunk by SCALE.

const SCALE        = 0.05;   // local units -> world units
const SUN_DISTANCE = 20;     // Earth's distance from its star, local units
const CAM_DIST     = 3.2;    // default camera distance from Earth, local units
const MARKER_SIZE  = 0.02;

export function createAdventures({ THREE, scene, camera, renderer, canvas, hoverLabel }, starPos) {
  const sys = { reveal: 0, clusterFade: 0 };

  const group = new THREE.Group();
  group.position.copy(starPos);
  group.scale.setScalar(SCALE);
  group.visible = false;
  scene.add(group);

  // Which way Earth sits from its star, and which side the camera views it from
  const up = new THREE.Vector3(0, 1, 0);
  const earthDir = new THREE.Vector3(1, 0.15, 0.4).normalize();
  const side = new THREE.Vector3().crossVectors(earthDir, up).normalize();
  // Behind Earth and off to the side, so the star stays in frame as the "sun"
  const viewDir = earthDir.clone().multiplyScalar(0.8).addScaledVector(side, 0.6).addScaledVector(up, 0.1).normalize();

  const earthHolder = new THREE.Group();
  earthHolder.position.copy(earthDir).multiplyScalar(SUN_DISTANCE);
  group.add(earthHolder);
  // World-space copies, refreshed whenever the system is turned to face the camera
  const earthWorld = new THREE.Vector3();
  const viewDirWorld = viewDir.clone();
  // Direction from the star to the resting camera, in local space
  const restDir = earthHolder.position.clone().addScaledVector(viewDir, CAM_DIST).normalize();

  const spin = new THREE.Group();
  spin.rotation.x = 0.5;
  spin.rotation.y = -0.1;
  earthHolder.add(spin);

  // These textures are huge, so decode them off the main thread and push them to the
  // GPU as soon as they arrive, rather than stalling mid-flight on first view
  const bitmapLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY' });
  const loadTexture = (url) => {
    const tex = new THREE.Texture();
    tex.flipY = false;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    bitmapLoader.load(url, (bitmap) => {
      tex.image = bitmap;
      tex.needsUpdate = true;
      renderer.initTexture(tex);
    });
    return tex;
  };
  const fadeables = [];

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshBasicMaterial({ map: loadTexture('/static/img/world-topo-4096.jpg'), transparent: true })
  );
  spin.add(globe);
  fadeables.push({ m: globe.material, max: 1 });

  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      color:         { value: new THREE.Color(0x6b93d6) },
      densityCenter: { value: 0.10 },
      densityEdge:   { value: 0.6 },
      opacity:       { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float densityCenter;
      uniform float densityEdge;
      uniform float opacity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float facing = dot(vNormal, vViewDir);           // 1 at center, 0 at edge
        float alpha = mix(densityEdge, densityCenter, facing);
        gl_FragColor = vec4(color, alpha * opacity);
      }
    `,
  });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.015, 64, 64), atmosphereMaterial);
  atmosphere.renderOrder = 1;  // everything here is transparent (for fading), so order it by hand
  spin.add(atmosphere);

  // Galaxy backdrop: follows the camera so it reads as infinitely far away.
  // Phones and small screens get a lighter version.
  const bigSky = renderer.capabilities.maxTextureSize >= 8192 && window.matchMedia('(min-width: 900px)').matches;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 64, 64),
    new THREE.MeshBasicMaterial({
      map: loadTexture(`/static/img/gaia-background-${bigSky ? 8000 : 4096}.jpg`),
      side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
    })
  );
  sky.rotation.x = 0.5;
  sky.renderOrder = -1;
  sky.visible = false;
  scene.add(sky);

  // ---- Markers ----------------------------------------------------------
  let destinations = [];
  const hitTargets = [];
  const scalables = [];

  function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
       radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  fetch('/adventures/destinations.json')
    .then(r => r.json())
    .then(data => {
      destinations = data;
      destinations.forEach((dest, i) => {
        const pos = latLngToVec3(dest.lat, dest.lng, 1.012);
        const box = new THREE.Mesh(
          new THREE.PlaneGeometry(MARKER_SIZE, MARKER_SIZE),
          new THREE.MeshBasicMaterial({ color: 0xe8e4df, transparent: true, opacity: 0, side: THREE.DoubleSide })
        );
        box.position.copy(pos);
        box.lookAt(0, 0, 0);
        box.renderOrder = 2;
        spin.add(box);
        fadeables.push({ m: box.material, max: 0.9 });

        const hit = new THREE.Mesh(
          new THREE.SphereGeometry(MARKER_SIZE * 1.5, 12, 12),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.position.copy(pos);
        hit.userData.destIndex = i;
        spin.add(hit);
        hitTargets.push(hit);
        scalables.push(box, hit);
      });
      sys.setReveal(sys.reveal);
      renderer.compile(scene, camera);
    })
    .catch(err => console.error('Could not load destinations:', err));

  // ---- Modal ------------------------------------------------------------
  const modalOverlay     = document.getElementById('modal-overlay');
  const modalTitle       = document.getElementById('modal-title');
  const modalGallery     = document.getElementById('modal-gallery');
  const modalDescription = document.getElementById('modal-description');

  const titleHTML = (d) => d.year ? `${d.name} <span class="year">${d.year}</span>` : d.name;

  function openModal(dest) {
    modalTitle.innerHTML = titleHTML(dest);
    modalGallery.innerHTML = '';
    dest.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = dest.name;
      img.loading = 'lazy';
      modalGallery.appendChild(img);
    });
    modalDescription.innerHTML = 'Loading…';
    modalOverlay.classList.add('open');

    fetch(`/adventures/destinations/${dest.slug}.html`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(html => { modalDescription.innerHTML = html; })
      .catch(() => { modalDescription.innerHTML = ''; });
  }

  const modalOpen = () => modalOverlay.classList.contains('open');
  const closeModal = () => modalOverlay.classList.remove('open');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  // ---- Interaction ------------------------------------------------------
  let camDist = CAM_DIST;
  let dragging = false, dragMoved = 0, autoRotate = true;
  let prev = { x: 0, y: 0 };
  let vel = { x: 0, y: 0 };

  sys.prepare = (incomingDir) => {
    group.quaternion.setFromUnitVectors(restDir, incomingDir);
    group.updateMatrixWorld(true);
    earthHolder.getWorldPosition(earthWorld);
    viewDirWorld.copy(viewDir).applyQuaternion(group.quaternion);
  };
  sys.prepare(restDir);
  renderer.compile(scene, camera);

  sys.restPose = () => ({
    pos: earthWorld.clone().addScaledVector(viewDirWorld, camDist * SCALE),
    look: earthWorld.clone(),
  });
  sys.pose = () => sys.restPose();

  sys.setReveal = (k) => {
    group.visible = k > 0.001;
    sky.visible = k > 0.001;
    sky.material.opacity = k;
    atmosphereMaterial.uniforms.opacity.value = k;
    fadeables.forEach(f => { f.m.opacity = f.max * k; });
  };

  sys.activate = () => {
    camDist = CAM_DIST;
    canvas.style.cursor = 'grab';
  };

  sys.deactivate = () => {
    dragging = false;
    closeModal();
    hoverLabel.classList.remove('visible');
    canvas.style.cursor = '';
  };

  sys.onPointerDown = (e) => {
    dragging = true;
    dragMoved = 0;
    autoRotate = false;
    prev = { x: e.clientX, y: e.clientY };
    vel = { x: 0, y: 0 };
  };

  sys.onPointerUp = () => { dragging = false; };

  sys.onPointerMove = (e, raycaster) => {
    const hits = raycaster.intersectObjects(hitTargets);
    if (hits.length && !dragging) {
      hoverLabel.innerHTML = titleHTML(destinations[hits[0].object.userData.destIndex]);
      hoverLabel.style.left = e.clientX + 14 + 'px';
      hoverLabel.style.top = e.clientY - 14 + 'px';
      hoverLabel.classList.add('visible');
      canvas.style.cursor = 'pointer';
    } else {
      hoverLabel.classList.remove('visible');
      canvas.style.cursor = dragging ? 'grabbing' : 'grab';
    }

    if (!dragging) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    dragMoved += Math.abs(dx) + Math.abs(dy);
    vel = { x: dy * 0.003, y: dx * 0.003 };
    spin.rotation.x += vel.x;
    spin.rotation.y += vel.y;
    prev = { x: e.clientX, y: e.clientY };
  };

  sys.onClick = (e, raycaster) => {
    if (dragMoved > 5) return;
    const hits = raycaster.intersectObjects(hitTargets);
    if (hits.length) openModal(destinations[hits[0].object.userData.destIndex]);
  };

  sys.onWheel = (e) => {
    camDist = Math.max(1.5, Math.min(10, camDist + e.deltaY * 0.002));
  };

  sys.onEscape = () => {
    if (!modalOpen()) return false;
    closeModal();
    return true;
  };

  sys.update = (dt, t, camera) => {
    if (!group.visible) return;
    sky.position.copy(camera.position);

    if (!dragging) {
      vel.x *= 0.95;
      vel.y *= 0.95;
      spin.rotation.x += vel.x;
      spin.rotation.y += vel.y;
      if (autoRotate) spin.rotation.y += 0.009 * dt;
      else if (Math.abs(vel.x) < 0.0001 && Math.abs(vel.y) < 0.0001) autoRotate = true;
    }

    // Keep markers the same size on screen as the camera zooms
    const s = camDist / CAM_DIST;
    scalables.forEach(m => m.scale.setScalar(s));
  };

  return sys;
}
