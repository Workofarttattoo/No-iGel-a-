import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js";

const hudCycle = document.getElementById("hud-cycle");
const hudCoherence = document.getElementById("hud-coherence");
const hudLatency = document.getElementById("hud-latency");
const hudFps = document.getElementById("hud-fps");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a13);
scene.fog = new THREE.Fog(0x050a13, 12, 28);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6.5, 12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = 8;
controls.maxDistance = 18;

const ambient = new THREE.AmbientLight(0xe0f2ff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.65);
directional.position.set(8, 12, 6);
directional.castShadow = false;
scene.add(directional);

const chamber = new THREE.Group();
scene.add(chamber);

const RING_RADIUS = 5;
const ADVISOR_COUNT = 6;

const ringGeometry = new THREE.RingGeometry(RING_RADIUS * 0.8, RING_RADIUS, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0x1a3a7a,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.4,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
chamber.add(ring);

const haloGeometry = new THREE.RingGeometry(RING_RADIUS * 0.2, RING_RADIUS * 0.45, 64);
const haloMaterial = new THREE.MeshBasicMaterial({
  color: 0x6bc8ff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.25,
});
const halo = new THREE.Mesh(haloGeometry, haloMaterial);
halo.rotation.x = Math.PI / 2;
chamber.add(halo);

const coherenceCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0x91f9ff,
    emissive: 0x3bc4ff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.85,
  })
);
coherenceCore.position.set(0, 1.2, 0);
chamber.add(coherenceCore);

const advisorMeshes = [];

function createAdvisor(index) {
  const angle = (index / ADVISOR_COUNT) * Math.PI * 2;
  const radius = RING_RADIUS * 0.9;
  const geometry = new THREE.SphereGeometry(0.35, 48, 48);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4f8dff,
    emissive: 0x0d2d6b,
    roughness: 0.35,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius);
  mesh.userData.labelAngle = angle;
  chamber.add(mesh);
  advisorMeshes[index] = mesh;
}

for (let i = 0; i < ADVISOR_COUNT; i += 1) {
  createAdvisor(i);
}

const labelCanvas = document.createElement("canvas");
labelCanvas.width = 512;
labelCanvas.height = 64;
const labelContext = labelCanvas.getContext("2d");

function drawLabel(text) {
  labelContext.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  labelContext.fillStyle = "rgba(8, 18, 35, 0.55)";
  labelContext.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  labelContext.fillStyle = "#9ecbff";
  labelContext.font = "32px 'Inter', 'Segoe UI', sans-serif";
  labelContext.textAlign = "center";
  labelContext.textBaseline = "middle";
  labelContext.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.needsUpdate = true;
  return texture;
}

const labelMaterial = new THREE.SpriteMaterial({ map: drawLabel("Virtue Council"), transparent: true });
const labelSprite = new THREE.Sprite(labelMaterial);
labelSprite.position.set(0, 3.2, 0);
labelSprite.scale.set(6, 1, 1);
chamber.add(labelSprite);

const clock = new THREE.Clock();
let lastFpsTime = performance.now();
let frameCount = 0;
let latestLatency = null;

function updateFps() {
  frameCount += 1;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    hudFps.textContent = `${fps}`;
    frameCount = 0;
    lastFpsTime = now;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  coherenceCore.scale.setScalar(1 + Math.sin(elapsed * 1.3) * 0.05);
  halo.material.opacity = 0.2 + Math.sin(elapsed * 0.6) * 0.05;
  controls.update();
  renderer.render(scene, camera);
  updateFps();
}

animate();

function updateAdvisors(data) {
  const { advisors, coherence } = data;
  advisors.forEach((advisor, index) => {
    const mesh = advisorMeshes[index];
    if (!mesh) {
      return;
    }
    const scale = 1 + advisor.resonance * 0.8;
    mesh.scale.setScalar(scale);

    const hue = advisor.polarity === "amplify" ? 0.58 : advisor.polarity === "attenuate" ? 0.64 : 0.6;
    const { color, emissive } = mesh.material;
    color.setHSL(hue, 0.62, 0.55 + advisor.resonance * 0.12);
    emissive.setHSL(hue, 0.75, 0.2 + advisor.resonance * 0.25);

    mesh.position.y = 0.5 + advisor.resonance * 0.9;
  });

  coherenceCore.material.emissiveIntensity = 0.4 + coherence * 0.9;
  labelMaterial.map = drawLabel(`Coherence ${coherence.toFixed(3)} :: Virtue Cadence Stable`);
  labelMaterial.map.needsUpdate = true;
}

const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsEndpoint = `${wsProtocol}://${window.location.host}/ws`;

const socket = new WebSocket(wsEndpoint);

socket.addEventListener("message", (event) => {
  const payload = JSON.parse(event.data);
  updateAdvisors(payload);
  const latency = performance.now() - payload.timestamp;
  latestLatency = latency;
  hudCycle.textContent = `${payload.cycle}`;
  hudCoherence.textContent = payload.coherence.toFixed(3);
  hudLatency.textContent = `${Math.round(latency)} ms`;
});

socket.addEventListener("error", () => {
  hudLatency.textContent = "stream offline";
});

socket.addEventListener("close", () => {
  hudLatency.textContent = "stream offline";
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setInterval(() => {
  if (latestLatency != null) {
    console.log(`[trace] latency ${latestLatency.toFixed(2)} ms`);
  }
}, 5000);
