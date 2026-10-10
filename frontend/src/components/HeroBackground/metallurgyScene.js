// Procedural "Processing → Structure → Properties" triangle, built from
// primitive Three.js geometry (no external models/textures to fetch).
// Exposes { start, stop, setQuality, setPointer, dispose } so the React
// wrapper can control the lifecycle without knowing any Three.js internals.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const LABELS = ["PROCESSING", "STRUCTURE", "PROPERTIES"];

// Renders a small label onto a canvas and returns it as a sprite that
// always faces the camera — cheaper than loading a font/texture asset.
function makeLabelSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "600 46px 'DM Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.anisotropy = 2;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.6, 0.65, 1);
  return { sprite, texture, material };
}

export function createMetallurgyScene(canvas, { mobile = false } = {}) {
  const disposables = [];
  const track = (obj) => {
    disposables.push(obj);
    return obj;
  };

  const scene = new THREE.Scene();
  scene.background = null; // transparent — hero's own CSS background shows through

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.3, mobile ? 11 : 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 1.75));

  // Soft procedural environment map — gives the metal realistic-looking
  // reflections without fetching an HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmrem.dispose();

  // ---- Lighting: soft, no neon/glow ----
  scene.add(new THREE.AmbientLight(0x3a4a5c, 0.6));
  const key = new THREE.DirectionalLight(0xdfe9f2, 0.9);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5c86a6, 0.4);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  // ---- The PSP triangle group ----
  const group = new THREE.Group();
  scene.add(group);

  const radius = 3.1;
  const vertexAngles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
  const vertices = vertexAngles.map(
    (a) => new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)
  );

  const steelMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0x9aa7b2,
      metalness: 0.92,
      roughness: 0.32,
      envMapIntensity: 1.1,
    })
  );
  const nodeMaterial = track(
    new THREE.MeshStandardMaterial({
      color: 0xb7c2ca,
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 1.25,
    })
  );

  // Vertex nodes (brushed-metal icosahedra read as "engineered" rather than
  // perfectly smooth balls).
  const nodeGeometry = track(new THREE.IcosahedronGeometry(0.46, 2));
  const nodes = vertices.map((v) => {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
    mesh.position.copy(v);
    group.add(mesh);
    return mesh;
  });

  // Edges connecting the three vertices — thin metallic tubes.
  const edgeGeometry = track(new THREE.CylinderGeometry(0.05, 0.05, 1, 10));
  const edgePairs = [
    [vertices[0], vertices[1]],
    [vertices[1], vertices[2]],
    [vertices[2], vertices[0]],
  ];
  edgePairs.forEach(([a, b]) => {
    const mesh = new THREE.Mesh(edgeGeometry, steelMaterial);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const len = dir.length();
    mesh.position.copy(mid);
    mesh.scale.set(1, len, 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    group.add(mesh);
  });

  // Thin technical rings orbiting the triangle — blueprint/schematic feel.
  const ringMaterial = track(
    new THREE.MeshBasicMaterial({
      color: 0x5c7891,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    })
  );
  const ringGeometry = track(new THREE.TorusGeometry(4.3, 0.006, 8, 64));
  const rings = [0, 1, 2].map((i) => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2 + i * 0.9;
    ring.rotation.y = i * 0.6;
    group.add(ring);
    return ring;
  });

  // Faint corner-to-center connecting lines, suggesting the PSP
  // cyclical relationship rather than a static shape.
  const lineMaterial = track(
    new THREE.LineBasicMaterial({ color: 0x7e97a9, transparent: true, opacity: 0.22 })
  );
  vertices.forEach((v) => {
    const points = [v.clone(), new THREE.Vector3(0, 0, 0)];
    const geom = track(new THREE.BufferGeometry().setFromPoints(points));
    group.add(new THREE.Line(geom, lineMaterial));
  });

  // Vertex labels.
  const labelColor = "#dfeaf1";
  const labelHandles = vertices.map((v, i) => {
    const { sprite, texture, material } = makeLabelSprite(LABELS[i], labelColor);
    track(texture);
    track(material);
    const dir = v.clone().normalize();
    sprite.position.copy(v.clone().add(dir.multiplyScalar(0.95)));
    group.add(sprite);
    return sprite;
  });

  // Sparse ambient particles — a hint of grain structure, not a swarm.
  const particleCount = mobile ? 40 : 90;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 5 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    particlePositions[i * 3 + 2] = r * Math.cos(phi) * 0.6 - 2;
  }
  const particleGeometry = track(new THREE.BufferGeometry());
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = track(
    new THREE.PointsMaterial({
      color: 0xcfe3ee,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    })
  );
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  group.scale.setScalar(mobile ? 0.62 : 0.92);
  group.position.x = mobile ? 0 : 1.1;
  particles.scale.copy(group.scale);
  particles.position.copy(group.position);

  // ---- Animation state ----
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0 };
  const basePos = camera.position.clone();

  function setPointer(x, y) {
    // x, y expected in [-1, 1]
    pointer.x = x;
    pointer.y = y;
  }

  function resize(width, height) {
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function render() {
    const t = clock.getElapsedTime();

    // Slow continuous rotation + gentle float.
    group.rotation.y = t * 0.055;
    group.rotation.x = Math.sin(t * 0.18) * 0.05;
    group.position.y = Math.sin(t * 0.25) * 0.12;

    rings.forEach((ring, i) => {
      ring.rotation.z = t * (0.03 + i * 0.012) * (i % 2 === 0 ? 1 : -1);
    });

    particles.rotation.y = -t * 0.015;

    labelHandles.forEach((sprite) => {
      // Sprites already billboard to camera; nothing extra needed, but keep
      // a steady subtle opacity breathing so labels feel "alive" without
      // being distracting.
      sprite.material.opacity = 0.74 + Math.sin(t * 0.4) * 0.06;
    });

    // Parallax: ease camera toward the pointer-offset target.
    const targetX = basePos.x + pointer.x * (mobile ? 0.12 : 0.45);
    const targetY = basePos.y + pointer.y * (mobile ? 0.08 : 0.3);
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(group.position.x * 0.3, 0, 0);

    renderer.render(scene, camera);
  }

  function dispose() {
    disposables.forEach((obj) => obj.dispose && obj.dispose());
    nodeGeometry.dispose();
    edgeGeometry.dispose();
    ringGeometry.dispose();
    particleGeometry.dispose();
    envTexture.dispose();
    renderer.dispose();
  }

  return { render, resize, setPointer, dispose };
}
