import * as THREE from "three";
import { latLonToVector3 } from "./utilities";

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
    description: string;
    quote: string;
    quoteAuthor: string;
    wikipedia: string;
    type?: string;
  }>,
  scene: THREE.Scene
): THREE.Sprite[] {
  const sprites: THREE.Sprite[] = [];
  wonders.forEach((wonder) => {
    const [longitude, latitude] = wonder.coordinates;
    const position = latLonToVector3([latitude, longitude], 1.01);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(wonder.image);

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(0.05, 0.05, 1);
    sprite.position.copy(position.clone().normalize().multiplyScalar(1.02));

    // Ensure userData has all expected properties
    sprite.userData = {
      name: wonder.name,
      description: wonder.description || "No description available",
      quote: wonder.quote || "No quote available",
      quoteAuthor: wonder.quoteAuthor || "Unknown",
      wikipedia: wonder.wikipedia || "#",
      image: wonder.image,
      type: wonder.type || "unknown",
    };

    scene.add(sprite);
    sprites.push(sprite);
  });

  return sprites;
}
