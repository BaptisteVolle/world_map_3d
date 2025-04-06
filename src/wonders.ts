import * as THREE from "three";
import { latLonToVector3 } from "./utilities";
import { showPopup } from "./popup";

export async function loadWonders(filePath: string) {
  const response = await fetch(filePath);
  const wonders = await response.json();
  return wonders;
}

export function plotWonders(
  wonders: Array<{
    name: string;
    coordinates: [number, number];
    image: string;
  }>,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) {
  wonders.forEach((wonder) => {
    const [longitude, latitude] = wonder.coordinates;
    const position = latLonToVector3([latitude, longitude], 1.01);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(wonder.image);

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(0.05, 0.05, 1);
    sprite.position.copy(position.clone().normalize().multiplyScalar(1.02));

    sprite.userData = wonder;
    scene.add(sprite);
  });

  window.addEventListener("click", (event) => {
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Create a raycaster and set it from the camera and mouse position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Intersect objects in the scene
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Debugging: Log the intersects array
    console.log(intersects);

    if (intersects.length > 0) {
      // Get the first intersected object
      const intersectedObject = intersects[0].object as THREE.Sprite;

      // Ensure the object has userData
      if (intersectedObject.userData) {
        const wonder = intersectedObject.userData as {
          name: string;
          description: string;
          quote: string;
          quoteAuthor: string;
          wikipedia: string;
          image: string;
        };

        // Show the popup with wonder details
        showPopup(wonder);
      } else {
        console.warn("Intersected object has no userData:", intersectedObject);
      }
    }
  });
}
