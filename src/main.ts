import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { showPopup, hidePopup, popup } from "./popup";
import { loadGeoJSON, plotCountries, plotCountryNames } from "./geojson";
import { loadWonders, plotWonders } from "./wonders";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

let naturalWondersSprites: THREE.Sprite[] = [];
let civilizationWondersSprites: THREE.Sprite[] = [];
let countryNameSprites: THREE.Sprite[] = [];

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(ambientLight, directionalLight);

// Earth sphere
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("textures/earth.jpg"); // Replace with your path
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(earth);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Load GeoJSON and plot countries
loadGeoJSON("assets/json/world-geo.json").then((geoJSON) => {
  plotCountries(geoJSON, scene);

  // Plot country names but keep them hidden initially
  countryNameSprites = plotCountryNames(geoJSON, scene);
  countryNameSprites.forEach((sprite) => (sprite.visible = false));
});

// Load and plot wonders
// Load and plot wonders
Promise.all([
  loadWonders("assets/json/natural-wonders.json"),
  loadWonders("assets/json/civilization-wonders.json"),
]).then(([naturalWonders, civilizationWonders]) => {
  // Here you need to store the returned sprites
  naturalWondersSprites = plotWonders(naturalWonders, scene);
  civilizationWondersSprites = plotWonders(civilizationWonders, scene);
  setupWonderClickHandler();
});

document
  .getElementById("toggle-natural")
  ?.addEventListener("change", (event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    naturalWondersSprites.forEach((sprite) => {
      sprite.visible = isChecked;
    });
  });

document
  .getElementById("toggle-civilization")
  ?.addEventListener("change", (event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    civilizationWondersSprites.forEach((sprite) => {
      sprite.visible = isChecked;
    });
  });

document
  .getElementById("toggle-countries")
  ?.addEventListener("change", (event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    countryNameSprites.forEach((sprite) => {
      sprite.visible = isChecked;
    });
  });

function setupWonderClickHandler() {
  let isDragging = false;

  // Detect mouse drag
  window.addEventListener("mousedown", () => {
    isDragging = false;
  });

  window.addEventListener("mousemove", () => {
    isDragging = true;
  });

  window.addEventListener("mouseup", (event) => {
    if (isDragging) {
      isDragging = false; // Reset drag state
      return; // Suppress popup on drag
    }

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with all wonders
    const allWonderSprites = [
      ...naturalWondersSprites,
      ...civilizationWondersSprites,
    ];
    const intersects = raycaster.intersectObjects(allWonderSprites, false);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object as THREE.Sprite;

      // Only show popup if the sprite is visible
      if (intersectedObject.visible && intersectedObject.userData) {
        const wonder = intersectedObject.userData as {
          name: string;
          description: string;
          quote: string;
          quoteAuthor: string;
          wikipedia: string;
          image: string;
        };

        showPopup(wonder, event);
      } else {
        hidePopup();
      }
    } else {
      hidePopup();
    }
  });
}

// Responsive canvas
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("click", (event) => {
  if (!popup.contains(event.target as Node)) {
    // This is handled by the wonder click handler now
    // We'll only hide if no wonder was clicked
  }
});
animate();
