import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { showPopup, hidePopup, popup } from "./popup";
import { loadGeoJSON, plotCountries } from "./geojson";
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
});

// Load and plot wonders
Promise.all([
  loadWonders("assets/json/natural-wonders.json"),
  loadWonders("assets/json/civilization-wonders.json"),
]).then(([naturalWonders, civilizationWonders]) => {
  plotWonders(naturalWonders, scene, camera);
  plotWonders(civilizationWonders, scene, camera);
});

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

// Hide popup when clicking elsewhere
window.addEventListener("click", (event) => {
  if (!popup.contains(event.target as Node)) {
    hidePopup();
  }
});
animate();
