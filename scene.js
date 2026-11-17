import * as THREE from './vendor/three.module.min.js?v=1601';

(() => {
  const host = document.querySelector('#scene-wrap');
  const canvas = document.querySelector('#scene-canvas');
  if (!host || !canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const randomRange = (min, max) => min + Math.random() * (max - min);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  camera.position.set(0, 0, 10);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true });
  } catch {
    host.classList.add('scene-fallback');
    host.dataset.sceneState = 'fallback';
    return;
  }
  host.dataset.sceneState = 'renderer-ready';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x171a1d, 0);

  scene.add(new THREE.AmbientLight(0x88939c, 1.5));
  const keyLight = new THREE.DirectionalLight(0xe8c64b, 3.2);
  keyLight.position.set(-3, 5, 8);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xef6b35, 18, 12);
  rimLight.position.set(4, -2, 4);
  scene.add(rimLight);

  const world = new THREE.Group();
  scene.add(world);
  const galaxyField = new THREE.Group();
  scene.add(galaxyField);

  const grid = new THREE.GridHelper(16, 32, 0xe8c64b, 0x647078);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -2.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.15;
  grid.material.depthWrite = false;
  world.add(grid);

  function addGalaxy(position, color, arms, count, radius) {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const arm = index % arms;
      const distance = Math.sqrt(Math.random()) * radius;
      const angle = (arm / arms) * Math.PI * 2 + distance * 1.35 + randomRange(-0.28, 0.28);
      const spread = randomRange(-0.08, 0.08) * (0.25 + distance);
      positions[index * 3] = Math.cos(angle) * distance + spread;
      positions[index * 3 + 1] = Math.sin(angle) * distance + spread;
      positions[index * 3 + 2] = randomRange(-0.16, 0.16);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const galaxy = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.018, transparent: true, opacity: 0.58, sizeAttenuation: true }));
    galaxy.position.set(...position);
    galaxyField.add(galaxy);
  }

  addGalaxy([-3.5, 2.45, -2.6], 0x8eabd6, 3, 240, 0.78);
  addGalaxy([3.45, -2.2, -2.8], 0xef9463, 4, 280, 0.9);
  addGalaxy([3.75, 2.65, -3.1], 0xd4c37b, 3, 210, 0.66);

  const orbitGroup = new THREE.Group();
  world.add(orbitGroup);
  [
    { radius: 3.25, rotation: [0.2, 0.12, -0.3], color: 0xe8c64b, opacity: 0.52 },
    { radius: 2.62, rotation: [0.8, 0.55, 0.36], color: 0x8e999f, opacity: 0.34 },
    { radius: 1.9, rotation: [1.28, 0.15, -0.62], color: 0xef6b35, opacity: 0.42 }
  ].forEach((spec) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, 0.009, 5, 180),
      new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: spec.opacity })
    );
    ring.rotation.set(...spec.rotation);
    orbitGroup.add(ring);
  });

  const center = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 1),
    new THREE.MeshStandardMaterial({ color: 0xe8c64b, emissive: 0xb18a23, emissiveIntensity: 0.32, metalness: 0.7, roughness: 0.22, flatShading: true })
  );
  center.userData = { destination: '#dispatches', homePosition: new THREE.Vector3(0, 0, 0), baseScale: 1, speed: 0.44, phase: 0, spin: 0.1, baseEmissive: 0.32, velocity: new THREE.Vector3(), burst: 0 };
  world.add(center);

  const geometryFactories = [
    () => new THREE.BoxGeometry(0.62, 0.62, 0.62),
    () => new THREE.OctahedronGeometry(0.52, 0),
    () => new THREE.DodecahedronGeometry(0.5, 0),
    () => new THREE.TetrahedronGeometry(0.58, 0),
    () => new THREE.TorusKnotGeometry(0.3, 0.095, 72, 9, 2, 3),
    () => new THREE.IcosahedronGeometry(0.47, 0)
  ];
  const destinations = ['#work', '#learning', '#about', '#contact', '#work', '#learning', '#about'];
  const colors = [0xef6b35, 0xe8c64b, 0xbcc4c5, 0x517cc1, 0xef6b35, 0xe8c64b, 0xbcc4c5];
  const sceneObjects = [center];

  for (let index = 0; index < destinations.length; index += 1) {
    const angle = (index / destinations.length) * Math.PI * 2 + randomRange(-0.2, 0.2);
    const radius = randomRange(2.35, 3.3);
    const geometry = geometryFactories[Math.floor(Math.random() * geometryFactories.length)]();
    const color = colors[index];
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.12,
      metalness: 0.68,
      roughness: 0.28,
      flatShading: true
    });
    const object = new THREE.Mesh(geometry, material);
    object.position.set(Math.cos(angle) * radius, randomRange(-2.2, 2.2), randomRange(-0.7, 0.9));
    object.scale.setScalar(randomRange(0.72, 1.08));
    object.userData = {
      destination: destinations[index],
      homePosition: object.position.clone(),
      baseScale: object.scale.x,
      speed: randomRange(0.42, 0.9),
      phase: randomRange(0, Math.PI * 2),
      spin: randomRange(-0.32, 0.32),
      baseEmissive: 0.12,
      velocity: new THREE.Vector3(),
      burst: 0
    };
    world.add(object);
    sceneObjects.push(object);
  }

  const satelliteOrbit = new THREE.Group();
  satelliteOrbit.rotation.set(0.52, -0.24, 0.18);
  world.add(satelliteOrbit);
  const satellite = new THREE.Group();
  satellite.position.set(4.05, 0.1, -0.4);
  satelliteOrbit.add(satellite);
  const satelliteMeshes = [
    new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.18), new THREE.MeshStandardMaterial({ color: 0xe8c64b, metalness: 0.82, roughness: 0.22, flatShading: true })),
    new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.045, 0.22), new THREE.MeshStandardMaterial({ color: 0x5076aa, emissive: 0x172b45, metalness: 0.72, roughness: 0.3, flatShading: true })),
    new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.045, 0.22), new THREE.MeshStandardMaterial({ color: 0x5076aa, emissive: 0x172b45, metalness: 0.72, roughness: 0.3, flatShading: true }))
  ];
  satelliteMeshes[1].position.x = -0.38;
  satelliteMeshes[2].position.x = 0.38;
  satelliteMeshes.forEach((mesh, index) => {
    satellite.add(mesh);
    mesh.userData = { destination: '#learning', homePosition: mesh.position.clone(), baseScale: 1, speed: 0.2, phase: index * 0.5, spin: 0, baseEmissive: 0.12, velocity: new THREE.Vector3(), burst: 0 };
    sceneObjects.push(mesh);
  });

  let seed = 90731;
  const seededRandom = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(280 * 3);
  for (let index = 0; index < 280; index += 1) {
    dustPositions[index * 3] = (seededRandom() - 0.5) * 11;
    dustPositions[index * 3 + 1] = (seededRandom() - 0.5) * 7;
    dustPositions[index * 3 + 2] = -1.6 - seededRandom() * 2.5;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: 0xbcc4c5, size: 0.025, transparent: true, opacity: 0.45, sizeAttenuation: true })
  );
  scene.add(dust);

  function makeShootingStar() {
    const streak = new THREE.Group();
    const trail = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.62, 0.18, 0)]),
      new THREE.LineBasicMaterial({ color: 0xe8c64b, transparent: true, opacity: 0.78 })
    );
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    streak.add(trail, head);
    streak.visible = false;
    streak.userData = { wait: randomRange(1, 7), life: 0, velocity: new THREE.Vector3() };
    world.add(streak);
    return streak;
  }
  const shootingStars = Array.from({ length: 3 }, makeShootingStar);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  const targetCamera = new THREE.Vector2(0, 0);
  let hoveredObject = null;
  let frameHandle = 0;
  let zoomLevel = 1;
  const clock = new THREE.Clock();

  function resizeScene() {
    const bounds = host.getBoundingClientRect();
    const width = Math.max(1, bounds.width || window.innerWidth);
    const height = Math.max(1, bounds.height || window.innerHeight - 76);
    camera.aspect = width / height;
    camera.position.z = 10 * Math.max(1, Math.min(2.1, 1.2 / camera.aspect)) * zoomLevel;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    host.dataset.sceneSize = `${Math.round(width)}x${Math.round(height)}`;
    renderer.render(scene, camera);
  }

  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    targetCamera.set(pointer.x, pointer.y);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(sceneObjects, false)[0]?.object || null;
    if (hoveredObject && hoveredObject !== hit) hoveredObject.material.emissiveIntensity = hoveredObject.userData.baseEmissive ?? 0.32;
    hoveredObject = hit;
    if (hoveredObject) hoveredObject.material.emissiveIntensity = 0.9;
    host.dataset.hovered = hoveredObject ? 'true' : 'false';
    if (reducedMotion) renderer.render(scene, camera);
  }

  function burstObject(object) {
    const motion = object.userData;
    if (!motion.velocity) motion.velocity = new THREE.Vector3();
    const direction = object.getWorldPosition(new THREE.Vector3()).sub(center.getWorldPosition(new THREE.Vector3())).normalize();
    if (direction.lengthSq() < 0.01) direction.set(randomRange(-1, 1), randomRange(-1, 1), 0.5).normalize();
    motion.velocity.addScaledVector(direction, 6.5);
    motion.velocity.z += 1.5;
    motion.burst = 1;
    object.material.emissiveIntensity = 1.1;
    if (reducedMotion) renderer.render(scene, camera);
  }

  function selectObject(event) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(sceneObjects, false)[0]?.object;
    if (!hit) return;
    burstObject(hit);
    const destination = hit.userData.destination;
    if (destination) {
      window.setTimeout(() => document.querySelector(destination)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }), reducedMotion ? 0 : 420);
    }
  }

  canvas.addEventListener('pointermove', updatePointer, { passive: true });
  canvas.addEventListener('pointerleave', () => {
    hoveredObject = null;
    host.dataset.hovered = 'false';
    targetCamera.set(0, 0);
  });
  canvas.addEventListener('click', selectObject);

  document.querySelectorAll('[data-scene-target]').forEach((control) => {
    control.addEventListener('click', () => {
      document.querySelector(control.dataset.sceneTarget)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  document.querySelectorAll('[data-scene-zoom]').forEach((control) => {
    control.addEventListener('click', () => {
      zoomLevel = THREE.MathUtils.clamp(zoomLevel + (control.dataset.sceneZoom === 'in' ? -0.15 : 0.15), 0.68, 1.42);
      host.dataset.zoomLevel = zoomLevel.toFixed(2);
      resizeScene();
    });
  });

  const resizeObserver = new ResizeObserver(resizeScene);
  resizeObserver.observe(host);
  window.addEventListener('resize', resizeScene, { passive: true });
  window.addEventListener('load', resizeScene, { once: true });
  requestAnimationFrame(resizeScene);
  resizeScene();
  host.dataset.sceneState = 'ready';

  function render() {
    frameHandle = requestAnimationFrame(render);
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    if (!reducedMotion) {
      const pointerX = hoveredObject ? world.rotation.y / 0.16 : targetCamera.x;
      const pointerY = hoveredObject ? -world.rotation.x / 0.1 : targetCamera.y;
      world.rotation.y += (pointerX * 0.16 - world.rotation.y) * 0.028;
      world.rotation.x += (-pointerY * 0.1 - world.rotation.x) * 0.028;
      orbitGroup.rotation.z += 0.012 * delta;
      galaxyField.rotation.z += 0.018 * delta;
      satelliteOrbit.rotation.z += 0.22 * delta;
      satelliteOrbit.rotation.y += 0.11 * delta;
      dust.rotation.z = elapsed * 0.012;
      sceneObjects.forEach((object) => {
        const motion = object.userData;
        const targetPosition = motion.homePosition.clone();
        targetPosition.y += Math.sin(elapsed * motion.speed + motion.phase) * 0.12;
        motion.velocity.addScaledVector(targetPosition.sub(object.position), 5.2 * delta);
        motion.velocity.multiplyScalar(Math.exp(-2.1 * delta));
        object.position.addScaledVector(motion.velocity, delta);
        motion.burst = Math.max(0, motion.burst - delta * 1.8);
        object.rotation.x += (0.003 + motion.spin * 0.002) * delta * 60;
        object.rotation.y += (0.004 + motion.spin * 0.003) * delta * 60;
        const targetScale = (motion.baseScale || 1) * (object === hoveredObject ? 1.12 : 1) * (1 + motion.burst * 0.28);
        object.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.09);
      });
      shootingStars.forEach((streak) => {
        const motion = streak.userData;
        if (!motion.active) {
          motion.wait -= delta;
          if (motion.wait <= 0) {
            motion.active = true;
            motion.life = randomRange(0.7, 1.25);
            motion.velocity.set(randomRange(-4, -2.4), randomRange(-1.2, -0.35), 0);
            streak.position.set(randomRange(-1.2, 4.5), randomRange(1.6, 3.8), randomRange(-0.2, 0.9));
            streak.visible = true;
          }
        } else {
          motion.life -= delta;
          streak.position.addScaledVector(motion.velocity, delta);
          streak.children[0].material.opacity = Math.max(0, motion.life) * 0.72;
          if (motion.life <= 0 || streak.position.x < -5) {
            streak.visible = false;
            motion.active = false;
            motion.wait = randomRange(3, 8);
          }
        }
      });
      camera.position.x += (targetCamera.x * 0.5 - camera.position.x) * 0.035;
      camera.position.y += (targetCamera.y * 0.34 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    render();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frameHandle) {
      cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    } else if (!document.hidden && !reducedMotion && !frameHandle) {
      render();
    }
  });
})();
