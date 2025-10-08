import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const canvas = document.getElementById("noigela-canvas");
const statusEl = document.getElementById("connection-status");
const feedEl = document.getElementById("whisper-feed");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020409);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 6.5);

const ambient = new THREE.AmbientLight(0x88d7ff, 0.7);
scene.add(ambient);

const rim = new THREE.DirectionalLight(0x33bbff, 0.8);
rim.position.set(-4, 6, 5);
scene.add(rim);

const noigelaGroup = new THREE.Group();
scene.add(noigelaGroup);

function buildWireSphere(radius, segments = 16) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshBasicMaterial({ color: 0x9ae8ff, wireframe: true });
  return new THREE.Mesh(geometry, material);
}

function buildWireCylinder(radiusTop, radiusBottom, height, radialSegments = 12) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);
  const material = new THREE.MeshBasicMaterial({ color: 0x9ae8ff, wireframe: true });
  return new THREE.Mesh(geometry, material);
}

function buildNoigela() {
  const body = buildWireSphere(0.9, 18);
  body.scale.set(1, 1.3, 1);
  noigelaGroup.add(body);

  const head = buildWireSphere(0.55, 18);
  head.position.set(0, 1.3, 0.2);
  noigelaGroup.add(head);

  const hatBrim = buildWireCylinder(0.75, 0.75, 0.08, 24);
  hatBrim.position.set(0, 1.72, 0.15);
  noigelaGroup.add(hatBrim);

  const hatTop = buildWireCylinder(0.45, 0.6, 0.6, 20);
  hatTop.position.set(0, 2.05, 0.15);
  noigelaGroup.add(hatTop);

  const legLeft = buildWireCylinder(0.12, 0.08, 1.3);
  legLeft.position.set(-0.35, -1.4, 0);
  legLeft.rotation.z = 0.18;
  legLeft.name = "leg-left";
  noigelaGroup.add(legLeft);

  const legRight = buildWireCylinder(0.12, 0.08, 1.3);
  legRight.position.set(0.35, -1.4, 0);
  legRight.rotation.z = -0.18;
  legRight.name = "leg-right";
  noigelaGroup.add(legRight);

  const armLeft = buildWireCylinder(0.1, 0.07, 1.1);
  armLeft.position.set(-1.05, 0.2, 0);
  armLeft.rotation.z = 1.15;
  armLeft.name = "arm-left";
  noigelaGroup.add(armLeft);

  const armRight = buildWireCylinder(0.1, 0.07, 1.1);
  armRight.position.set(1.05, 0.2, 0);
  armRight.rotation.z = -1.15;
  armRight.name = "arm-right";
  noigelaGroup.add(armRight);

  const cane = buildWireCylinder(0.05, 0.05, 1.6, 12);
  cane.position.set(1.2, -0.25, 0.3);
  cane.rotation.x = 0.35;
  cane.name = "cane";
  noigelaGroup.add(cane);

  noigelaGroup.position.y = 0.5;
}

buildNoigela();

const clock = new THREE.Clock();
let mode = "idle";
let celebrationTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const bob = Math.sin(t * 2) * 0.05;
  noigelaGroup.position.y = 0.5 + bob;
  noigelaGroup.rotation.y = Math.sin(t * 0.5) * 0.1;

  const legLeft = noigelaGroup.getObjectByName("leg-left");
  const legRight = noigelaGroup.getObjectByName("leg-right");
  const armLeft = noigelaGroup.getObjectByName("arm-left");
  const armRight = noigelaGroup.getObjectByName("arm-right");
  const cane = noigelaGroup.getObjectByName("cane");

  const swingSpeed = mode === "celebrate" ? 6 : 3;
  const swingMagnitude = mode === "celebrate" ? 0.9 : 0.4;
  const armMagnitude = mode === "celebrate" ? 0.7 : 0.35;

  if (legLeft && legRight && armLeft && armRight) {
    legLeft.rotation.x = Math.sin(t * swingSpeed) * swingMagnitude + 0.5;
    legRight.rotation.x = Math.sin((t * swingSpeed) + Math.PI) * swingMagnitude + 0.5;
    armLeft.rotation.x = Math.sin((t * swingSpeed) + Math.PI / 2) * armMagnitude;
    armRight.rotation.x = Math.sin((t * swingSpeed) + (3 * Math.PI) / 2) * armMagnitude;
  }

  if (cane) {
    cane.rotation.z = Math.sin(t * (mode === "celebrate" ? 5 : 2.5)) * 0.35;
  }

  if (mode === "celebrate") {
    celebrationTimer += clock.getDelta();
    noigelaGroup.rotation.y += Math.sin(t * 4) * 0.02;
    if (celebrationTimer > 6) {
      mode = "idle";
      celebrationTimer = 0;
    }
  }

  renderer.render(scene, camera);
}

animate();

function setMode(nextMode) {
  if (nextMode === "celebrate") {
    celebrationTimer = 0;
  }
  mode = nextMode;
}

function appendWhisper(entry) {
  const container = document.createElement("section");
  container.className = "whisper";
  const time = document.createElement("time");
  time.textContent = new Date(entry.timestamp ?? Date.now()).toLocaleTimeString();
  container.appendChild(time);
  const p = document.createElement("p");
  p.textContent = entry.message ?? "No'iGeL(a) is thinking...";
  if (entry.mood === "celebrate") {
    p.classList.add("mood-celebrate");
  } else if (entry.mood === "concern") {
    p.classList.add("mood-concern");
  }
  container.appendChild(p);

  if (entry.recommendations?.length) {
    const ul = document.createElement("ul");
    entry.recommendations.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  feedEl.prepend(container);
  while (feedEl.children.length > 20) {
    feedEl.removeChild(feedEl.lastChild);
  }
}

function setStatus(state, label) {
  statusEl.textContent = label;
  statusEl.className = `status ${state}`;
}

function openSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/noigela`);

  socket.addEventListener("open", () => {
    setStatus("connected", "connected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === "whisper") {
        appendWhisper(payload);
        setMode(payload.mood ?? "idle");
        if (payload.mood === "celebrate") {
          setStatus("connected", "celebrating insight");
        } else if (payload.mood === "concern") {
          setStatus("warning", "caution flagged");
        }
      }
    } catch (error) {
      console.error("[noigela] Failed to parse message", error);
    }
  });

  socket.addEventListener("close", () => {
    setStatus("warning", "reconnecting...");
    setTimeout(openSocket, 1500);
  });

  socket.addEventListener("error", () => {
    setStatus("danger", "connection error");
    socket.close();
  });
}

openSocket();

window.addEventListener("resize", () => {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
