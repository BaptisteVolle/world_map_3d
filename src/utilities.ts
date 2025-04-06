import * as THREE from "three";

export function latLonToVector3(
  coordinates: number[],
  radius: number
): THREE.Vector3 {
  const phi = (90 - coordinates[0]) * (Math.PI / 180);
  const theta = (coordinates[1] + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
